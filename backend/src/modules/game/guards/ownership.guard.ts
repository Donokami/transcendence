import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  Logger
} from '@nestjs/common'

import { type Observable } from 'rxjs'

import { type IRequestWithUser } from '@/core/types/request-with-user'

import { GameService } from '../game.service'

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private readonly gameService: GameService) {}

  private readonly logger = new Logger(OwnershipGuard.name)

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<IRequestWithUser>()
    const roomId = req.params.id

    const room = this.gameService.findOne(roomId)

    if (!room) {
      this.logger.warn(`Room ${roomId} not found`)
      return false
    }

    if (room.owner.id === req.session.userId) {
      this.logger.verbose(`User ${req.session.userId} owns room ${roomId}`)
      return true
    }

    return false
  }
}
