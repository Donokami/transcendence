import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  Logger
} from '@nestjs/common'

@Injectable()
export class GroupGuard implements CanActivate {
  private readonly logger = new Logger(GroupGuard.name)

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    if (request.channel.isDm() === true) {
      this.logger.warn(`Channel with ID : ${request.channel.id} is not a group`)
      return false
    }

    return true
  }
}
