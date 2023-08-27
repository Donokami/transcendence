import { createParamDecorator, type ExecutionContext } from '@nestjs/common'

export const CurrentChannel = createParamDecorator(
  async (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()

    return request.channel
  }
)
