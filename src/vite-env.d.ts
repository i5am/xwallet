/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_ETH_RPC_URL: string;
  readonly VITE_ETH_CHAIN_ID: string;
  readonly VITE_CRVA_REGISTRY_ADDRESS: string;
  readonly VITE_CRVA_COMMITTEE_ADDRESS: string;
  readonly VITE_CRVA_THRESHOLD_ADDRESS: string;
  readonly VITE_CRVA_ENABLED: string;
  readonly VITE_CRVA_MIN_VERIFIERS: string;
  readonly VITE_DEV_MODE: string;
  readonly VITE_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
