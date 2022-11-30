import React from "react";

import { useWrappedTokenBalance } from "../../../hooks/useTokenBalance";
import { AssetSelection } from "../../common/AssetSelection";
import { AsyncButton } from "../../common/AsyncButton";
import { Module } from "../../common/Module";
import { RowBetween } from "../../common/RowBetween";
import { Settings } from "../../common/Settings";
import { SubModule } from "../../common/SubModule";
import { Field, useSwapState } from "./useSwapState";

export const Swap: React.FC = () => {
  const {
    selectedFrom,
    selectedTo,

    onFieldInput,
    onFieldSelect,

    typedValue,

    swapDisabledReason,
    trade,
    handleTrade,
  } = useSwapState();

  const fromBalance = useWrappedTokenBalance(selectedFrom);
  const toBalance = useWrappedTokenBalance(selectedTo);

  return (
    <>
      <Module tw="p-0">
        <div tw="flex justify-between w-full p-6 pb-0 items-center">
          <p tw=" font-semibold text-xl text-default">
            Trade perpetual options
          </p>
          <Settings />
        </div>
        <div tw="flex flex-col max-w-lg bg-gray-100">
          <div tw="  gap-2 flex flex-col p-6 bg-white">
            <AssetSelection
              label={<span>From</span>}
              onSelect={(value) => onFieldSelect(Field.Input, value)}
              selectedValue={selectedFrom}
              inputValue={typedValue}
              inputOnChange={(value) => onFieldInput(Field.Input, value)}
              currentAmount={{
                amount: fromBalance ?? undefined,
                allowSelect: true,
              }}
            />
          </div>
          <div tw="flex items-center justify-center self-center">
            <div tw="text-secondary  justify-center items-center flex text-sm border-l-[15px]  border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-white w-0 " />
          </div>
          <div tw="flex flex-col gap-2 p-6 pt-2">
            <AssetSelection
              label={<span>To (Estimate)</span>}
              tw=""
              inputDisabled={true}
              onSelect={(value) => onFieldSelect(Field.Output, value)}
              selectedValue={selectedTo}
              inputValue={trade?.outputAmount.toSignificant(6)}
              inputOnChange={(value) => onFieldInput(Field.Output, value)}
              currentAmount={{
                amount: toBalance ?? undefined,
                allowSelect: false,
              }}
            />
          </div>
        </div>
        <SubModule tw="">
          <RowBetween tw="flex justify-between">
            <p>Funding rate</p>
            <p tw="font-bold">10%</p>
          </RowBetween>
          <hr tw="border-[#AEAEB2] rounded " />

          <RowBetween tw="flex justify-between">
            <p>Upper Bound</p>
            <p tw="font-bold">5 ETH / UNI</p>
          </RowBetween>
        </SubModule>
      </Module>
      <AsyncButton
        variant="primary"
        tw="flex w-full text-xl h-12 p-0"
        disabled={!!swapDisabledReason}
        onClick={async () => {
          await handleTrade();
          onFieldInput(Field.Input, "");
        }}
      >
        {swapDisabledReason ?? "Swap"}
      </AsyncButton>
    </>
  );
};
