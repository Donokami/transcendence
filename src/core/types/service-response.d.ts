export interface error {
  message: string
  code: string
}

export interface ServiceResponse<T> {
  data: T | null
  error: error | null
}
