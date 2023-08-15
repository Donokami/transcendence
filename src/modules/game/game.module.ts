import { Module } from '@nestjs/common'
import { GameGateway } from './game.gateway'
import { UsersModule } from '../users/users.module'
import { GameController } from './game.controller'
import { GameService } from './game.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Match } from './entities/match.entity'

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Match])],
  controllers: [GameController],
  providers: [GameGateway, GameService],
  exports: [GameService]
})
export class GameModule {}
