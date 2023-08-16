import { IsUUID } from 'class-validator'

export class UserIdParams {
  @IsUUID('4')
  id: string
}
