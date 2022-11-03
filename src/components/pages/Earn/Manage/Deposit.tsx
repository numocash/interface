import { TokenAmount } from "@dahlia-labs/token-utils";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { useTokenBalances } from "../../../../hooks/useTokenBalance";
import { AssetSelection } from "../../../common/AssetSelection";
import { useManage } from ".";

export const Deposit: React.FC = () => {
  const { market, setDepositSpeculativeAmount, setDepositBaseAmount } =
    useManage();
  const { address } = useAccount();

  const [speculativeInput, setSpeculativeInput] = useState("");
  const [baseInput, setBaseInput] = useState("");

  const balances = useTokenBalances(
    useMemo(
      () => [market.pair.speculativeToken, market.pair.baseToken],
      [market.pair.baseToken, market.pair.speculativeToken]
    ),
    address
  );

  return (
    <div tw="flex flex-col rounded-lg bg-amber-100">
      <div tw=" pb-0 gap-2 flex flex-col p-6 bg-white">
        <AssetSelection
          label={<span>Input</span>}
          selectedValue={market.pair.speculativeToken}
          inputValue={speculativeInput}
          inputOnChange={(value) => {
            setSpeculativeInput(value);
            setDepositSpeculativeAmount(
              TokenAmount.parse(market.pair.speculativeToken, value)
            );
          }}
          currentAmount={{
            amount: balances && balances[0] ? balances[0] : undefined,
            allowSelect: true,
          }}
        />
      </div>
      <div tw="flex items-center justify-center self-center">
        <div tw="text-secondary  justify-center items-center flex text-sm border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-white w-0" />
        <div tw="text-secondary  justify-center items-center flex text-sm border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[15px] border-b-amber-100 w-0 mt-[-30px]  " />
      </div>
      <div tw="flex flex-col gap-2 p-6">
        <AssetSelection
          label={<span>Input</span>}
          tw=""
          selectedValue={market.pair.baseToken}
          inputValue={baseInput}
          inputOnChange={(value) => {
            setBaseInput(value);
            setDepositBaseAmount(
              TokenAmount.parse(market.pair.baseToken, value)
            );
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
