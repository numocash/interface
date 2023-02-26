import { Percent } from "@uniswap/sdk-core";
import { useCallback, useState } from "react";
import { styled } from "twin.macro";

import { useSettings } from "../../../contexts/settings";
import { ReactComponent as SettingsIcon } from "../../../icons/settings.svg";
import { X } from "../../common/Filter";
import { BigNumericInput } from "../../common/inputs/BigNumericInput";
import { Switch } from "../../common/inputs/Switch";
import { Modal } from "../../common/Modal";
import { HeaderItem } from "./Nav";

interface Props {
  className?: string;
}

export const Settings: React.FC<Props> = ({ className }: Props) => {
  const settings = useSettings();
  const [show, setShow] = useState(false);
  // const [targetRef, setTargetRef] = useState<HTMLElement | null>(null);
  const [inputDeadline, setInputDeadline] = useState("");
  const [inputSlippage, setInputSlippage] = useState("");

  const onDismiss = useCallback(() => {
    if (!Number.isNaN(parseInt(inputDeadline))) {
      settings.setTimeout(parseInt(inputDeadline));
    }
    if (!Number.isNaN(parseFloat(inputSlippage))) {
      settings.setMaxSlippagePercent(
        new Percent((parseFloat(inputSlippage) * 100).toFixed(0), 10000)
      );
    }
    setShow(false);
    setInputDeadline("");
    setInputSlippage("");
  }, [inputDeadline, inputSlippage, settings]);

  return (
    <>
      <Modal onDismiss={onDismiss} isOpen={show}>
        <div tw="px-6 py-3 rounded-lg w-full bg-background">
          <div tw="flex justify-between items-center">
            <div tw="font-semibold text-lg">Settings</div>
            <X onClick={onDismiss} />
          </div>
          <div tw="flex rounded-xl py-2 gap-1 w-full items-center justify-between">
            <div tw="flex justify-start">Transaction Deadline</div>
            <div tw="flex items-center gap-1">
              <BigNumericInput
                tw="text-right text-lg w-20 rounded-lg bg-secondary px-1"
                placeholder={settings.timeout.toString()}
                inputMode="numeric"
                autoComplete="off"
                disabled={false}
                value={inputDeadline}
                onChange={(val: string) => setInputDeadline(val)}
              />
              <div tw="text-paragraph text-sm">Minutes</div>
            </div>
          </div>
          <div tw="flex py-2 gap-1 w-full items-center justify-between">
            <div tw="flex justify-start">Allowed Slippage</div>
            <div tw="flex items-center gap-1">
              <BigNumericInput
                tw="text-right text-lg text-paragraph w-32 rounded-lg bg-secondary px-1"
                placeholder={settings.maxSlippagePercent.toFixed(2)}
                inputMode="numeric"
                autoComplete="off"
                disabled={false}
                value={inputSlippage}
                onChange={(val: string) => setInputSlippage(val)}
              />
              <div tw="text-paragraph text-sm">%</div>
            </div>
          </div>
          <div tw="flex py-2 gap-1 justify-between items-center">
            <div tw="">Infinite Approval</div>
            <div tw="">
              <Switch
                selected={settings.infiniteApprove}
                onSelect={settings.setInfiniteApprove}
              />
            </div>
          </div>
        </div>
      </Modal>
      <button className={className} tw="" onClick={() => setShow(true)}>
        <HeaderItem
          item={
            <SettingsIcon tw="transform hover:rotate-90 duration-300 ease-in-out h-6" />
          }
          label="Settings"
        />
      </button>
    </>
  );
};

export const ToastExitButton = styled.span`
  font-size: 20px;
  cursor: pointer;
  color: #888d9b;

  &:hover {
    color: #000;
  }
`;
