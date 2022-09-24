import { TokenAmount } from "@dahlia-labs/token-utils";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { useTokenBalances } from "../../../../hooks/useTokenBalance";
import { AssetSelection } from "../../../common/AssetSelection";
import { useCreatePair } from ".";

export const SelectPair: React.FC = () => {
  const { address } = useAccount();

  const {
    speculativeToken,
    baseToken,
    setSpeculativeTokenAmount,
    setBaseTokenAmount,
  } = useCreatePair();

  const [speculativeInput, setSpeculativeInput] = useState("");
  const [baseInput, setBaseInput] = useState("");

  const balances = useTokenBalances([speculativeToken, baseToken], address);

  return (
    <div tw="p-6 flex flex-col justify-between">
      <div tw="flex flex-col items-center text-default w-full pb-3">
        <AssetSelection
          tw="flex w-full max-w-2xl"
          label={"Speculative Asset"}
          selectedValue={speculativeToken}
          inputValue={speculativeInput}
          inputOnChange={(value) => {
            setSpeculativeInput(value);
            invariant(speculativeToken);
            setSpeculativeTokenAmount(
              TokenAmount.parse(speculativeToken, value)
            );
          }}
          currentAmount={{
            amount: balances && balances[0] ? balances[0] : undefined,
            allowSelect: true,
          }}
        />
        <FaPlus tw="text-default mb-8 mt-4" />

        <AssetSelection
          label={"Base Asset"}
          selectedValue={baseToken}
          inputValue={baseInput}
          inputOnChange={(value) => {
            setBaseInput(value);
            invariant(baseToken);
            setBaseTokenAmount(TokenAmount.parse(baseToken, value));
          }}
          currentAmount={{
            amount: balances && balances[1] ? balances[1] : undefined,
            allowSelect: true,
          }}
        />
      </div>
    </div>
  );
};
