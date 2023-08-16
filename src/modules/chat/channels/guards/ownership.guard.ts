import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  Logger
} from '@nestjs/common'

@Injectable()
export class OwnershipGuard implements CanActivate {
  private readonly logger = new Logger(OwnershipGuard.name)

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const userId = request.session.userId
    const { channel } = request

    if (userId !== channel.owner.id) {
      this.logger.warn(
        `User with ID : ${userId} is not the owner of channel with ID : ${channel.id}`
      )
      return false
    }

    return true
  }
}
