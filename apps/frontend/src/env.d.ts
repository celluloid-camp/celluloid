/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMMIT: string
  readonly API_URL: string
  readonly WS_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
