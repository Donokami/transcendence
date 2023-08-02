import { ref, type Ref, type UnwrapRef } from 'vue'

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
      throw new HttpError(error.message, res.status)
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
      throw new HttpError(error.message, res.status)
    }
    console.log(`[Fetcher] - post : `, res)
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
      throw new HttpError(error.message, res.status)
    }
    return await res.json()
  }

  async patch(
    url: string = '',
    body: any = {},
    config: RequestInit = {}
  ): Promise<any> {
    console.log(body)
    const res = await fetch(this.baseURL + url, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      ...config
    })

    console.log(`[Fetcher] - patch : `, res)

    if (!res.ok) {
      const error = await res.json()
      throw new HttpError(error.message, res.status)
    }
    return await res.json()
  }
}

export interface FetcherResponse<T> {
  data: Ref<UnwrapRef<T | null>>
  error: Ref<UnwrapRef<HttpError | null>>
  loading: Ref<UnwrapRef<boolean>>
}

export function useFetcher<T>({
  queryFn,
  onSuccess
}: {
  queryFn: Promise<any>
  onSuccess?: (data: T) => any
}): FetcherResponse<T> {
  const data = ref<T | null>(null)
  const error = ref<HttpError | null>(null)
  const loading = ref(true)

  queryFn
    .then((res) => {
      data.value = res

      if (onSuccess != null) {
        onSuccess(res)
      }
    })
    .catch((err) => {
      if (err instanceof HttpError) {
        error.value = err as unknown as HttpError
      } else {
        error.value = new HttpError(err.message, 500)
      }
    })
    .finally(() => {
      loading.value = false
    })

  return {
    data,
    error,
    loading
  }
}

export const fetcher = new Fetcher()

export default new Fetcher()
