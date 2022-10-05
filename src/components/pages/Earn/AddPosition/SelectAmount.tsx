import { TokenAmount } from "@dahlia-labs/token-utils";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useAccount } from "wagmi";

import { useTokenBalances } from "../../../../hooks/useTokenBalance";
import { AssetSelection } from "../../../common/AssetSelection";
import { useAddPosition } from ".";

export const SelectAmount: React.FC = () => {
  const { address } = useAccount();

  const { market, setSpeculativeTokenAmount, setBaseTokenAmount } =
    useAddPosition();

  const [speculativeInput, setSpeculativeInput] = useState("");
  const [baseInput, setBaseInput] = useState("");

  const balances = useTokenBalances(
    [market?.pair.speculativeToken ?? null, market?.pair.baseToken ?? null],
    address
  );

  return market ? (
    <div tw="flex flex-col mt-4 pb-0 items-center pb-2">
      <AssetSelection
        label={"Speculative Asset"}
        selectedValue={market.pair.speculativeToken}
        inputValue={speculativeInput}
        inputOnChange={(value) => {
          setSpeculativeInput(value);
          setSpeculativeTokenAmount(
            TokenAmount.parse(market.pair.speculativeToken, value)
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
        selectedValue={market.pair.baseToken}
        inputValue={baseInput}
        inputOnChange={(value) => {
          setBaseInput(value);
          setBaseTokenAmount(TokenAmount.parse(market.pair.baseToken, value));
        }}
        currentAmount={{
          amount: balances && balances[1] ? balances[1] : undefined,
          allowSelect: true,
        }}
      />
    </div>
  ) : null;
};
