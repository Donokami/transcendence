import { IsUUID } from 'class-validator'

export class BlockerIdParams {
  @IsUUID('4')
  observedUser: string
}
