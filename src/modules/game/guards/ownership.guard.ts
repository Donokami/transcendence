import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';

import { type Observable } from 'rxjs';

import { type RequestWithUser } from '@/core/types/request-with-user';

import { GameService } from '../game.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private readonly gameService: GameService) {}

  private readonly logger = new Logger(OwnershipGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return new Promise(async (resolve) => {
      try {
        const req = context.switchToHttp().getRequest<RequestWithUser>();
        const gameId = req.params.id;

        const game = await this.gameService.findOne(gameId);

        if (!game) {
          this.logger.warn(`Game ${gameId} not found`);
          resolve(false);
        }

        if (game.getRoom().owner.id === req.session.userId) {
          this.logger.verbose(`User ${req.session.userId} owns game ${gameId}`);
          resolve(true);
        }

        resolve(false);
      } catch (e) {}
    });
  }
}
