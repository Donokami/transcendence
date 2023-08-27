interface ImportMetaEnv {
  readonly VITE_APP_BASE_URL: string
  readonly VITE_SOCKET_URL: string
  readonly VITE_API_URL: string
  readonly VITE_APP_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
