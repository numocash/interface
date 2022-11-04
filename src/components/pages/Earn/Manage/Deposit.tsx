import { TokenAmount } from "@dahlia-labs/token-utils";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { useTokenBalances } from "../../../../hooks/useTokenBalance";
import { AssetSelection } from "../../../common/AssetSelection";
import { Input, useManage } from ".";

export const Deposit: React.FC = () => {
  const {
    market,
    setDepositAmount,
    speculativeAmount: depositSpeculativeAmount,
    baseAmount: depositBaseAmount,
  } = useManage();
  const { address } = useAccount();

  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<Input | null>(null);

  const balances = useTokenBalances(
    useMemo(
      () => [market.pair.speculativeToken, market.pair.baseToken],
      [market.pair.baseToken, market.pair.speculativeToken]
    ),
    address
  );

  return (
    <div tw="flex flex-col rounded-lg bg-gray-100">
      <div tw=" pb-0 gap-2 flex flex-col p-6 bg-white">
        <AssetSelection
          label={<span>Input</span>}
          selectedValue={market.pair.speculativeToken}
          inputValue={
            selected === Input.Speculative
              ? input
              : depositSpeculativeAmount?.toSignificant() ?? ""
          }
          inputOnChange={(value) => {
            setInput(value);
            setSelected(Input.Speculative);
            setDepositAmount(
              Input.Speculative,
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
        <div tw="text-secondary  justify-center items-center flex text-sm border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[15px] border-b-gray-100 w-0 mt-[-30px]  " />
      </div>
      <div tw="flex flex-col gap-2 p-6 pt-3">
        <AssetSelection
          label={<span>Input</span>}
          tw=""
          selectedValue={market.pair.baseToken}
          inputValue={
            selected === Input.Base
              ? input
              : depositBaseAmount?.toSignificant() ?? ""
          }
          inputOnChange={(value) => {
            setInput(value);
            setSelected(Input.Base);
            setDepositAmount(
              Input.Base,
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
