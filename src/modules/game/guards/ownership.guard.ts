import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { Observable } from 'rxjs';

import { type RequestWithUser } from '@/core/types/request-with-user';

import { GameService } from '../game.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private readonly gameService: GameService) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return new Promise(async (resolve) => {
      try {
        const req = context.switchToHttp().getRequest<RequestWithUser>();
        const gameId = req.params.id;

        const game = await this.gameService.findOne(gameId);

        if (game.ownerId === req.user.id) {
          resolve(true);
        }

        resolve(false);
      } catch (e) { }
    });
  }
}
