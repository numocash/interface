import React, { useMemo } from "react";

import { AssetSelection } from "../../../common/AssetSelection";
import { AsyncButton } from "../../../common/AsyncButton";
import { Module } from "../../../common/Module";
import { useArbState } from "./useArbState";

export const Arbitrage: React.FC = () => {
  const {
    market,
    selectedTo,
    setSelectedTo,

    typedValue,
    setValue,

    swapDisabledReason,
    trade,
    handleTrade,
  } = useArbState();

  const tokens = useMemo(
    () => [market.pair.baseToken, market.pair.speculativeToken],
    [market.pair.baseToken, market.pair.speculativeToken]
  );

  return (
    <>
      <Module tw="p-0">
        <div tw="flex justify-between w-full p-6 pb-0 items-center">
          <p tw=" font-semibold text-xl text-default">Arbitrage</p>
        </div>
        <div tw="flex flex-col max-w-lg bg-gray-100 rounded-lg">
          <div tw="  gap-2 flex flex-col p-6 bg-white">
            <AssetSelection
              label={<span>Arb amount</span>}
              selectedValue={market.pair.speculativeToken}
              inputValue={typedValue}
              inputOnChange={setValue}
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
              onSelect={setSelectedTo}
              selectedValue={selectedTo}
              inputValue={trade?.outputAmount.toSignificant(6)}
              tokens={tokens}
            />
          </div>
        </div>
      </Module>
      <AsyncButton
        variant="primary"
        tw="flex w-full text-xl h-12 p-0"
        disabled={!!swapDisabledReason}
        onClick={async () => {
          await handleTrade();
          setValue("");
        }}
      >
        {swapDisabledReason ?? "Arbitrage"}
      </AsyncButton>
    </>
  );
};
