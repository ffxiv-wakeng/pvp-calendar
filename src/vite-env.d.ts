/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string
  readonly VITE_SUPPORT_GAME_VER: string
  readonly VITE_LAST_UPDATE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
