import { ConfigService } from '@nestjs/config'
import {
  type CanActivate,
  type ExecutionContext,
  Logger,
  Injectable
} from '@nestjs/common'

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name)
  constructor(private readonly configService: ConfigService) {}
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()

    this.logger.verbose(`Session user ID : ${request.session.userId}`)

    return (
      request.session.userId ||
      this.configService.get('NODE_ENV') === 'development' // this line allow to bypass the auth guard in development mode
    )
  }
}
