import { Injectable, Logger } from '@nestjs/common'

import { Subject } from 'rxjs'
import { UsersService } from './modules/users/users.service'

@Injectable()
export class AppService {

  constructor(private usersService: UsersService) { }
  // ****** //
  // LOGGER //
  // ****** //

  private logger: Logger = new Logger(AppService.name)
  private shutdownListener$: Subject<void> = new Subject()

  // ******************** //
  // FUNCTION DEFINITIONS //
  // ******************** //

  onModuleDestroy() {
    this.usersService.disconnectAll()
    this.logger.log('Shutting down...')
  }

  subscribeToShutdown(shutdownFn: () => void): void {
    this.shutdownListener$.subscribe(() => shutdownFn())
  }

  shutdown() {
    this.shutdownListener$.next()
  }
}
