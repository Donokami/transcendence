import { Module } from '@nestjs/common'
import { GameGateway } from './game.gateway'
import { UsersModule } from '../users/users.module'
import { GameController } from './game.controller'
import { GameService } from './game.service'

@Module({
  imports: [UsersModule],
  controllers: [GameController],
  providers: [GameGateway, GameService],
  exports: [GameService]
})
export class GameModule {}
