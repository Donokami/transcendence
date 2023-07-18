import { RoomError } from '@/core/constants/errors'
import { error } from '@/core/types/service-response'
import { BadRequestException, NotFoundException } from '@nestjs/common'

export const roomErrorHandler = (error: error) => {
  switch (error.code) {
    case RoomError.NOT_FOUND:
      throw new NotFoundException(error.message)
    default:
      throw new BadRequestException(error.message)
  }
}
