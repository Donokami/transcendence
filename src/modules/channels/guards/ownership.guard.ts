import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { Observable } from 'rxjs';

import { RequestWithUser } from '../interfaces/request-with-user.interface';

import { ChannelsService } from '../channels.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private readonly channelsService: ChannelsService) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return new Promise(async (resolve) => {
      try {
        const req = context.switchToHttp().getRequest<RequestWithUser>();
        const channelId = req.params.id;

        const channel = await this.channelsService.findOne(channelId);

        if (channel.ownerId === req.user.id) {
          resolve(true);
        }

        resolve(false);
      } catch (e) { }
    });
  }
}
