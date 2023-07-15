import {
  type CanActivate,
  type ExecutionContext,
  Logger,
} from '@nestjs/common';

export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    this.logger.verbose(`Session user ID : ${request.session.userId}`);

    return request.session.userId;
  }
}
