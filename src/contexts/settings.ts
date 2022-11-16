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
}

interface SettingsStore {
  maxSlippagePercent: number;
  timeout: number;
  infiniteApprove: boolean;
}

const useSettingsInternal = (): ISettings => {
  const store = localStorage.getItem("NumoenSettings");
  const storedSlip = store ? (JSON.parse(store) as SettingsStore) : null;
  const [maxSlippagePercent, setMaxSlippagePercent] = useState<Percent>(
    storedSlip
      ? new Percent(storedSlip.maxSlippagePercent, 10000)
      : new Percent(200, 10_000)
  );
  const [timeout, setTimeout] = useState<number>(
    storedSlip ? storedSlip.timeout : 30
  );
  const [infiniteApprove, setInfiniteApprove] = useState(
    storedSlip ? storedSlip.infiniteApprove : false
  );
  return {
    maxSlippagePercent,
    setMaxSlippagePercent: (val: Percent) => {
      setMaxSlippagePercent(val);
      localStorage.setItem(
        "NumoenSettings",
        JSON.stringify({
          maxSlippagePercent: +val.asFraction.multiply(10_000).toFixed(0),
          timeout,
          infiniteApprove,
        })
      );
    },
    timeout,
    setTimeout: (val: number) => {
      setTimeout(val);
      localStorage.setItem(
        "NumoenSettings",
        JSON.stringify({
          maxSlippagePercent: +maxSlippagePercent.asFraction
            .multiply(10_000)
            .toFixed(0),
          timeout: val,
          infiniteApprove,
        })
      );
    },
    infiniteApprove,
    setInfiniteApprove: (val: boolean) => {
      setInfiniteApprove(val);
      localStorage.setItem(
        "NumoenSettings",
        JSON.stringify({
          maxSlippagePercent: +maxSlippagePercent.asFraction
            .multiply(10_000)
            .toFixed(0),
          timeout,
          infiniteApprove: val,
        })
      );
    },
  };
};

export const { Provider: SettingsProvider, useContainer: useSettings } =
  createContainer(useSettingsInternal);
