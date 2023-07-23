import { Module, ValidationPipe, type MiddlewareConsumer } from '@nestjs/common'
import { APP_PIPE } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { type RequestHandler } from 'express'

import * as passport from 'passport'

import config from './core/config'
import { TypeOrmConfigService } from './core/config/database.config'

import { AuthModule } from '@/modules/auth/auth.module'
import { ChatModule } from '@/modules/chat/chat.module'
import { GameModule } from '@/modules/game/game.module'
import { SocialModule } from '@/modules/social/social.module'
import { UsersModule } from '@/modules/users/users.module'
import { UserSerializer } from '@/modules/auth/user.serializer'

import { AppController } from './app.controller'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const session: RequestHandler = require('cookie-session')({
  name: 'session',
  keys: [config().cookieSessionKey]
})

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [config]
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads'
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService
    }),
    ChatModule,
    SocialModule,
    GameModule,
    UsersModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [
    UserSerializer,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidUnknownValues: true
      })
    }
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(session).forRoutes('*')
    consumer.apply(passport.initialize(), passport.session()).forRoutes('*')
  }
}
