/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DEXI_VERSION?: string;
  /**
   * When "true", always call the full `VITE_API_BASE_URL` from the browser
   * (cross-origin; API must send valid CORS). Default is same-origin path mode.
   */
  readonly VITE_API_CROSS_ORIGIN?: string;
}
