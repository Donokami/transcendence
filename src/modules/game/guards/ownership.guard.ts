import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  Logger
} from '@nestjs/common'

import { type Observable } from 'rxjs'

import { type RequestWithUser } from '@/core/types/request-with-user'

import { GameService } from '../game.service'

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private readonly gameService: GameService) {}

  private readonly logger = new Logger(OwnershipGuard.name)

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    return new Promise(async (resolve) => {
      try {
        const req = context.switchToHttp().getRequest<RequestWithUser>()
        const roomId = req.params.id

        const { data: room } = await this.gameService.findOne(roomId)

        if (!room) {
          this.logger.warn(`Room ${roomId} not found`)
          resolve(false)
        }

        if (room.owner.id === req.session.userId) {
          this.logger.verbose(`User ${req.session.userId} owns room ${roomId}`)
          resolve(true)
        }

        resolve(false)
      } catch (e) {}
    })
  }
}
