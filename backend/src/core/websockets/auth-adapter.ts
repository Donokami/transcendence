import { type INestApplicationContext, Logger } from '@nestjs/common'
import { isFunction, isNil } from '@nestjs/common/utils/shared.utils'
import { type ConfigService } from '@nestjs/config'
import {
  AbstractWsAdapter,
  type MessageMappingProperties
} from '@nestjs/websockets'
import { DISCONNECT_EVENT } from '@nestjs/websockets/constants'
import { fromEvent, type Observable } from 'rxjs'
import { filter, first, map, mergeMap, share, takeUntil } from 'rxjs/operators'
import { Server } from 'socket.io'
import { session } from '@/app.module'
import { UsersService } from '@/modules/users/users.service'

export class SocketIoAdapter extends AbstractWsAdapter {
  usersService: UsersService
  constructor(
    private readonly app: INestApplicationContext,
    private readonly configService: ConfigService
  ) {
    super(app)
    app.resolve<UsersService>(UsersService).then((usersService) => {
      this.usersService = usersService
    })
  }

  private readonly logger = new Logger(SocketIoAdapter.name)

  public create(
    port: number,
    options?: any & { namespace?: string; server?: any }
  ): any {
    port = this.configService.get('SOCKET_PORT')
    if (!options) {
      return this.createIOServer(port)
    }
    options.allowRequest = (req: any, allowFn: any) => {
      const cookieString = req.headers.cookie

      const request: any = {
        connection: { encrypted: false },
        headers: { cookie: cookieString },
        session: {}
      }

      const response: any = { getHeader: () => {}, setHeader: () => {} }

      session(request, response, async () => {
        if (!request.session.userId) {
          return allowFn('Unauthorized', false)
        }
        const user = await this.usersService.findOneById(request.session.userId)
        if (!user) {
          return allowFn('Unauthorized', false)
        }
        this.logger.log(`User ${user.username} connected to socket.io`)
        req.user = user
        allowFn(null, true)
      })
    }

    const { namespace, server, ...opt } = options
    return server && isFunction(server.of)
      ? server.of(namespace)
      : namespace
      ? this.createIOServer(port, opt).of(namespace)
      : this.createIOServer(port, opt)
  }

  public createIOServer(port: number, options?: any): any {
    if (this.httpServer && port === 0) {
      const s = new Server(this.httpServer, {
        cors: {
          origin: this.configService.get('FRONTEND_URL'),
          methods: ['GET', 'POST'],
          credentials: true
        },
        cookie: {
          name: 'session',
          httpOnly: true,
          path: '/'
        },
        // Allow 1MB of data per request.
        maxHttpBufferSize: 1e6
      })

      return s
    }
    return new Server(port, options)
  }

  public bindMessageHandlers(
    client: any,
    handlers: MessageMappingProperties[],
    transform: (data: any) => Observable<any>
  ) {
    const disconnect$ = fromEvent(client, DISCONNECT_EVENT).pipe(
      share(),
      first()
    )

    handlers.forEach(({ message, callback }) => {
      const source$ = fromEvent(client, message).pipe(
        mergeMap((payload: any) => {
          const { data, ack } = this.mapPayload(payload)
          return transform(callback(data, ack)).pipe(
            filter((response: any) => !isNil(response)),
            map((response: any) => [response, ack])
          )
        }),
        takeUntil(disconnect$)
      )
      source$.subscribe(([response, ack]) => {
        if (response.event) {
          return client.emit(response.event, response.data)
        }
        isFunction(ack) && ack(response)
      })
    })
  }

  public mapPayload(payload: any): { data: any; ack?: Function } {
    if (!Array.isArray(payload)) {
      return { data: payload }
    }
    const lastElement = payload[payload.length - 1]
    const isAck = isFunction(lastElement)
    if (isAck) {
      const size = payload.length - 1
      return {
        data: size === 1 ? payload[0] : payload.slice(0, size),
        ack: lastElement
      }
    }
    return { data: payload }
  }
}
