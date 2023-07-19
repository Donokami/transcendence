import {
  type CanActivate,
  type ExecutionContext,
  Injectable
} from '@nestjs/common'

import { type Observable } from 'rxjs'

import { type IRequestWithUser } from '@/core/types/request-with-user'

import { UsersService } from '../users.service'

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    return new Promise(async (resolve) => {
      try {
        const req = context.switchToHttp().getRequest<IRequestWithUser>()
        const gameId = req.params.id

        const user = await this.usersService.findOneById(gameId) // todo: check this seems sus

        if (user.id === req.user.id) {
          resolve(true)
        }

        resolve(false)
      } catch (e) {}
    })
  }
}
