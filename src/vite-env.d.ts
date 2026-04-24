/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LAST_UPDATE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
