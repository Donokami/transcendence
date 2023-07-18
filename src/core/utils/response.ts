import type { ServiceResponse as Response } from '../types/service-response'

export const response = <T>(data?: T, error?: any): ServiceResponse<T> => ({
  data: data || null,
  error: error || null
})

export type ServiceResponse<T> = Response<T>
