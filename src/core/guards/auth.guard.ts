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

    return request.session.userId
  }
}
