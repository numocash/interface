import { Percent } from "@dahlia-labs/token-utils";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useState } from "react";
import { styled } from "twin.macro";

import { useSettings } from "../../contexts/settings";
import { Drop } from "./Drop";
import { BigNumericInput } from "./inputs/BigNumericInput";
import { Switch } from "./inputs/Switch";

export const Settings: React.FC = () => {
  const settings = useSettings();
  const [show, setShow] = useState(false);
  const [targetRef, setTargetRef] = useState<HTMLElement | null>(null);
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
    <div>
      <Drop
        onDismiss={onDismiss}
        show={show}
        target={targetRef}
        placement="auto"
      >
        <div tw="p-3 rounded-lg border border-gray-400 bg-white  w-full">
          <div tw="flex justify-between items-center">
            <div tw="font-semibold text-lg">Settings</div>
            <ToastExitButton onClick={onDismiss}>×</ToastExitButton>
          </div>
          <div tw="flex flex-col bg-white  rounded-xl p-2 gap-1">
            <div tw="flex justify-start">Transaction Deadline</div>
            <div tw="flex items-center gap-1">
              <BigNumericInput
                tw="text-right text-lg"
                placeholder={settings.timeout.toString()}
                inputMode="numeric"
                autoComplete="off"
                disabled={false}
                value={inputDeadline}
                onChange={(val: string) => setInputDeadline(val)}
              />
              <div tw="text-secondary text-sm">Minutes</div>
            </div>
          </div>
          <div tw="flex flex-col  p-2 gap-1">
            <div tw="flex justify-start">Allowed Slippage</div>
            <div tw="flex items-center gap-1">
              <BigNumericInput
                tw="text-right text-lg text-default"
                placeholder={settings.maxSlippagePercent.toFixed(2)}
                inputMode="numeric"
                autoComplete="off"
                disabled={false}
                value={inputSlippage}
                onChange={(val: string) => setInputSlippage(val)}
              />
              <div tw="text-secondary text-sm">%</div>
            </div>
          </div>
          <div tw="flex  p-2 gap-1 justify-between items-center">
            <div tw="">Infinite Approval</div>
            <div tw="">
              <Switch
                selected={settings.infiniteApprove}
                onSelect={settings.setInfiniteApprove}
              />
            </div>
          </div>
        </div>
      </Drop>
      <button
        tw="text-default flex items-center text-lg"
        ref={setTargetRef}
        onClick={() => setShow(true)}
      >
        <FontAwesomeIcon
          tw="transform hover:rotate-90 duration-300 delay-100"
          icon={faGear}
          fixedWidth
        />
      </button>
    </div>
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
