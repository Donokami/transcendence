export interface HttpError {
  message: string
  status: number
}

class Fetcher {
  async get(url: string = '', config: RequestInit = {}) {
    const res = await fetch(import.meta.env.VITE_API_URL + url, {
      method: 'GET',
      credentials: 'include',
      ...config
    })
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return res.json()
  }

  async post(url: string = '', body: any = {}, config: RequestInit = {}) {
    const res = await fetch(import.meta.env.VITE_API_URL + url, {
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
      throw {
        message: error.message,
        status: res.status
      }
    }
    return res.json()
  }
}

export const fetcher = new Fetcher()

export default new Fetcher()
