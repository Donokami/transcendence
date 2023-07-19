import { Controller, Get } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

@Controller()
export class AppController {
  @Get()
  @ApiOperation({
    summary: 'Get api infos',
    operationId: 'getRoot',
    description: 'Get api infos',
    tags: ['default']
  })
  getRoot(): { version: string } {
    return { version: 'v1' }
  }
  @Get('/heartbeat')
  @ApiOperation({
    summary: 'Get api status',
    operationId: 'getHeartBeat',
    description: 'Get api status',
    tags: ['default']
  })
  getHeartBeat(): { status: string } {
    return { status: 'ok' }
  }
}
