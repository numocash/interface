import { useState } from "react";
import { useAccount } from "wagmi";

import { useTokenBalances } from "../../../../hooks/useTokenBalance";
import { AssetSelection } from "../../../common/AssetSelection";
import { CenterSwitch } from "../../../common/CenterSwitch";
import { Module } from "../../../common/Module";
import { useCreatePair } from ".";

export const SelectPair: React.FC = () => {
  const { address } = useAccount();

  const { speculativeToken, baseToken } = useCreatePair();

  const [speculativeInput, setSpeculativeInput] = useState("");
  const [baseInput, setBaseInput] = useState("");

  const balances = useTokenBalances([speculativeToken, baseToken], address);

  return (
    <Module tw="flex max-w-xl w-full flex-col">
      <p tw="font-bold text-default text-xl">1. Select Pair</p>
      <p tw=" text-default text-sm mt-2">
        Select the tokens you wish to pair together and the amount you wish to
        deposit for each
      </p>
      <div tw="mt-4 pb-0">
        <AssetSelection
          label={"Speculative Asset"}
          selectedValue={speculativeToken}
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
          selectedValue={baseToken}
          inputValue={baseInput}
          inputOnChange={(value) => setBaseInput(value)}
          currentAmount={{
            amount: balances && balances[1] ? balances[1] : undefined,
            allowSelect: true,
          }}
        />
      </div>
    </Module>
  );
};
