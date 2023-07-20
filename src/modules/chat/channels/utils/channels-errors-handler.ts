import { ChannelError } from '@/core/constants/errors/channel-error'
import { error } from '@/core/types/service-response'
import { BadRequestException, NotFoundException } from '@nestjs/common'

export const channelErrorHandler = (error: error) => {
  switch (error.code) {
    case ChannelError.NOT_FOUND:
      throw new NotFoundException(error.message)
    default:
      throw new BadRequestException(error.message)
  }
}
