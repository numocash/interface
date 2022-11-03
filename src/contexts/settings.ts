import { Percent } from "@dahlia-labs/token-utils";
import { useState } from "react";
import { createContainer } from "unstated-next";

export interface ISettings {
  /**
   * Maximum amount of tolerated slippage, in [0, 1].
   */
  maxSlippagePercent: Percent;
  setMaxSlippagePercent: (amt: Percent) => void;

  /**
   * Maximum time before revert, in seconds.
   */
  timeout: number;
  setTimeout: (time: number) => void;

  /**
   * Whether to use infinite or minimal approval
   */
  infiniteApprove: boolean;
  setInfiniteApprove: (choice: boolean) => void;

  /**
   * Whether to use remote path computation or client-side
   */
  minimaApi: boolean;
  setMinimaApi: (choice: boolean) => void;
}

const useSettingsInternal = (): ISettings => {
  const [maxSlippagePercent, setMaxSlippagePercent] = useState<Percent>(
    new Percent(200, 10_000)
  );
  const [timeout, setTimeout] = useState<number>(30);
  const [infiniteApprove, setInfiniteApprove] = useState(false);
  const [minimaApi, setMinimaApi] = useState(true);
  return {
    maxSlippagePercent,
    setMaxSlippagePercent,
    timeout,
    setTimeout,
    infiniteApprove,
    setInfiniteApprove,
    minimaApi,
    setMinimaApi,
  };
};

export const { Provider: SettingsProvider, useContainer: useSettings } =
  createContainer(useSettingsInternal);
