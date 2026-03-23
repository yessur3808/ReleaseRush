// eslint-disable-next-line import/no-unresolved
import { ExternalProvider } from "@ethersproject/providers";
// eslint-disable-next-line import/no-unresolved
import { Config } from "@/namespaces";

interface MmiEthereumProvider extends ExternalProvider {
  request: (params: unknown) => Promise<unknown>;
  _metamask?: {
    isUnlocked: () => Promise<boolean>;
  };
}

declare global {
  interface Window {
    __env__: Config.Env;
    ethereum?: MmiEthereumProvider;
    __BUILD_INFO__?: {
      COMMIT_HASH: string;
      COMMIT_TIME: string | null;
      TAG: string | null;
      BUILD_TIME: string | null;
    };
    wc?: {
      waitReady: () => Promise<void>;
      initialized: boolean;
    };
    ull?: (newLogLevel: unknown) => void;
  }
  interface Navigator {
    brave?: {
      isBrave: () => Promise<boolean>;
    };
  }
}
