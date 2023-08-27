export class ApiError extends Error {
  statusCode: number
  code: string
  timestamp: Date
  path: string
  method: string

  constructor(
    message: string,
    statusCode: number,
    code: string,
    timestamp: Date,
    path: string,
    method: string
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.timestamp = timestamp
    this.path = path
    this.method = method
  }
}

export class HttpError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

class Fetcher {
  private readonly baseURL = import.meta.env.VITE_API_URL

  async get(url: string = '', config: RequestInit = {}): Promise<any> {
    const res = await fetch(this.baseURL + url, {
      method: 'GET',
      credentials: 'include',
      ...config
    })
    if (!res.ok) {
      const error = await res.json()
      if (!error.code) {
        throw new Error('Fetch error')
      }
      throw new ApiError(
        error.message,
        res.status,
        error.code,
        error.timestamp,
        error.path,
        error.method
      )
    }
    return await res.json()
  }

  async post(
    url: string = '',
    body: any = {},
    config: RequestInit = {}
  ): Promise<any> {
    const res = await fetch(this.baseURL + url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      ...config
    })
    if (!res.ok) {
      const error = await res.json()
      if (!error.code) {
        throw new HttpError(error.message, res.status)
      }
      throw new ApiError(
        error.message,
        res.status,
        error.code,
        error.timestamp,
        error.path,
        error.method
      )
    }
    return await res.json()
  }

  async delete(
    url: string = '',
    body: any = {},
    config: RequestInit = {}
  ): Promise<any> {
    const res = await fetch(this.baseURL + url, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      ...config
    })

    if (!res.ok) {
      const error = await res.json()
      if (!error.code) {
        throw new HttpError(error.message, res.status)
      }
      throw new ApiError(
        error.message,
        res.status,
        error.code,
        error.timestamp,
        error.path,
        error.method
      )
    }
    return await res.json()
  }

  async put(
    url: string = '',
    body: any = {},
    config: RequestInit = {}
  ): Promise<any> {
    const res = await fetch(this.baseURL + url, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      ...config
    })

    if (!res.ok) {
      const error = await res.json()
      if (!error.code) {
        throw new HttpError(error.message, res.status)
      }
      throw new ApiError(
        error.message,
        res.status,
        error.code,
        error.timestamp,
        error.path,
        error.method
      )
    }
    return await res.json()
  }

  async patch(
    url: string = '',
    body: any = {},
    config: RequestInit = {}
  ): Promise<any> {
    const res = await fetch(this.baseURL + url, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      ...config
    })

    if (!res.ok) {
      const error = await res.json()
      if (!error.code) {
        throw new HttpError(error.message, res.status)
      }
      throw new ApiError(
        error.message,
        res.status,
        error.code,
        error.timestamp,
        error.path,
        error.method
      )
    }
    return await res.json()
  }
}

export const fetcher = new Fetcher()

export default new Fetcher()
