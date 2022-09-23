import { useState } from "react";
import { useAccount } from "wagmi";

import { useTokenBalances } from "../../../../hooks/useTokenBalance";
import { AssetSelection } from "../../../common/AssetSelection";
import { CenterSwitch } from "../../../common/CenterSwitch";
import { Module } from "../../../common/Module";
import { useAddPosition } from ".";

export const SelectAmount: React.FC = () => {
  const { address } = useAccount();

  const { market } = useAddPosition();

  const [speculativeInput, setSpeculativeInput] = useState("");
  const [baseInput, setBaseInput] = useState("");

  const balances = useTokenBalances(
    [market?.pair.speculativeToken ?? null, market?.pair.baseToken ?? null],
    address
  );

  return market ? (
    <Module tw="flex max-w-xl w-full flex-col">
      <p tw="font-bold text-default text-xl">1. Add Amounts</p>
      <p tw=" text-default text-sm mt-2">
        Select the tokens you wish to pair together and the amount you wish to
        deposit for each
      </p>
      <div tw="mt-4 pb-0">
        <AssetSelection
          label={"Speculative Asset"}
          selectedValue={market.pair.speculativeToken}
          inputValue={speculativeInput}
          inputOnChange={(value) => setSpeculativeInput(value)}
          currentAmount={{
            amount: balances && balances[0] ? balances[0] : undefined,
            allowSelect: true,
          }}
        />
        <CenterSwitch icon="plus" />
        <AssetSelection
          label={"Base Asset"}
          selectedValue={market.pair.baseToken}
          inputValue={baseInput}
          inputOnChange={(value) => setBaseInput(value)}
          currentAmount={{
            amount: balances && balances[1] ? balances[1] : undefined,
            allowSelect: true,
          }}
        />
      </div>
    </Module>
  ) : null;
};
