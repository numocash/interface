import { Percent } from "@uniswap/sdk-core";
import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

import { useSettings } from "../../../contexts/settings";
import { formatPercent } from "../../../utils/format";
import { Drop } from "../../common/Drop";
import { Module } from "../../common/Module";
import { BigNumericInput } from "../../common/inputs/BigNumericInput";
import { Switch } from "../../common/inputs/Switch";

interface Props {
  className?: string;
}

export const Settings: React.FC<Props> = ({ className }: Props) => {
  const [show, setShow] = useState(false);
  const [targetRef, setTargetRef] = useState<HTMLElement | null>(null);

  return (
    <>
      <Drop
        onDismiss={() => setShow(false)}
        show={show}
        target={targetRef}
        placement={"bottom-start"}
      >
        <Module tw="px-4 py-2 rounded-2xl bg-[#303030] gap-2 flex flex-col">
          <SettingsInner />
        </Module>
      </Drop>
      <button
        className={className}
        ref={setTargetRef}
        onClick={() => setShow(true)}
        tw="items-center gap-2"
      >
        <p tw="text-white">Settings </p>
        <IoIosArrowDown tw="text-white opacity-80" />
      </button>
    </>
  );
};

export const SettingsInner: React.FC = () => {
  const settings = useSettings();

  const [inputDeadline, setInputDeadline] = useState("");
  const [inputSlippage, setInputSlippage] = useState("");

  const [showDeadline, setShowDeadline] = useState(false);
  const [showSlippage, setShowSlippage] = useState(false);

  return (
    <>
      <div tw="flex flex-col w-full gap-2">
        <div tw="flex  w-full items-center justify-between">
          <p tw="text-white opacity-80 pr-8 ">Transaction Deadline</p>
          <div tw="gap-2 items-center flex">
            <div tw="rounded-xl bg-[#4f4f4f] border-[#505050] border py-1 text-white w-16  flex justify-center">
              {settings.timeout} Mins
            </div>
            <IoIosArrowDown
              tw="text-white opacity-80"
              onClick={() => setShowDeadline(!showDeadline)}
            />
          </div>
        </div>
        {showDeadline && (
          <div tw="flex items-center gap-2">
            <BigNumericInput
              tw="text-right text-lg w-full rounded-lg px-1"
              placeholder={settings.timeout.toString()}
              inputMode="numeric"
              autoComplete="off"
              disabled={false}
              value={inputDeadline}
              onChange={(val: string) => setInputDeadline(val)}
            />
            <button
              onClick={() => {
                if (!Number.isNaN(parseInt(inputDeadline))) {
                  settings.setTimeout(parseInt(inputDeadline));
                }
                setInputDeadline("");
              }}
              tw="bg-[#4f4f4f] border-[#505050] border py-1 text-white rounded-xl px-2"
            >
              Set
            </button>
          </div>
        )}
      </div>
      <div tw="border-b border-[#505050] w-full" />
      <div tw="flex flex-col w-full gap-2">
        <div tw="flex  gap-1 w-full items-center justify-between">
          <div tw="flex justify-start text-white opacity-80">
            Allowed Slippage
          </div>

          <div tw="gap-2 items-center flex">
            <div tw="rounded-xl bg-[#4f4f4f] border-[#505050] border px-2 py-1 text-white w-16  flex justify-center">
              {formatPercent(settings.maxSlippagePercent)}
            </div>
            <IoIosArrowDown
              tw="text-white opacity-80"
              onClick={() => setShowSlippage(!showSlippage)}
            />
          </div>
        </div>
        {showSlippage && (
          <div tw="flex items-center gap-1">
            <BigNumericInput
              tw="text-right text-lg w-full rounded-lg px-1"
              placeholder={settings.maxSlippagePercent.toFixed(2)}
              inputMode="numeric"
              autoComplete="off"
              disabled={false}
              value={inputSlippage}
              onChange={(val: string) => setInputSlippage(val)}
            />
            <button
              onClick={() => {
                if (!Number.isNaN(parseFloat(inputSlippage))) {
                  settings.setMaxSlippagePercent(
                    new Percent(
                      (parseFloat(inputSlippage) * 100).toFixed(0),
                      10000
                    )
                  );
                }
                setInputSlippage("");
              }}
              tw="bg-[#4f4f4f] border-[#505050] border py-1 text-white rounded-xl px-2"
            >
              Set
            </button>
          </div>
        )}
      </div>
      <div tw="border-b border-[#505050] w-full" />
      <div tw="flex gap-1 justify-between items-center w-full">
        <div tw="text-white opacity-80">Infinite Approval</div>
        <div tw="">
          <Switch
            selected={settings.infiniteApprove}
            onSelect={settings.setInfiniteApprove}
          />
        </div>
      </div>
    </>
  );
};
