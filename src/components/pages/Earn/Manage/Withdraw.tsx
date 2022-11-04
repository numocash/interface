import { TokenAmount } from "@dahlia-labs/token-utils";
import { useMemo } from "react";

import { useUserLendgine } from "../../../../hooks/useLendgine";
import { usePair } from "../../../../hooks/usePair";
import { AssetSelection } from "../../../common/AssetSelection";
import { PercentageSlider } from "../../../common/inputs/PercentageSlider";
import { useManage } from ".";

export const Withdraw: React.FC = () => {
  const { withdrawPercent, setWithdrawPercent, market, tokenID } = useManage();
  const pairInfo = usePair(market.pair);
  const userLendgineInfo = useUserLendgine(tokenID ?? null, market);

  const { userBaseAmount, userSpeculativeAmount } = useMemo(() => {
    if (pairInfo && pairInfo.totalLPSupply.equalTo(0))
      return {
        userBaseAmount: new TokenAmount(market.pair.baseToken, 0),
        userSpeculativeAmount: new TokenAmount(market.pair.speculativeToken, 0),
      };
    const userBaseAmount =
      userLendgineInfo && pairInfo
        ? pairInfo.baseAmount
            .multiply(userLendgineInfo.liquidity)
            .divide(pairInfo.totalLPSupply)
        : null;
    const userSpeculativeAmount =
      userLendgineInfo && pairInfo
        ? pairInfo.speculativeAmount
            .multiply(userLendgineInfo.liquidity)
            .divide(pairInfo.totalLPSupply)
        : null;
    return { userBaseAmount, userSpeculativeAmount };
  }, [
    market.pair.baseToken,
    market.pair.speculativeToken,
    pairInfo,
    userLendgineInfo,
  ]);

  return (
    <div tw="flex flex-col rounded-lg bg-gray-100">
      <div tw=" pb-0 gap-2 flex flex-col p-6 bg-white">
        <PercentageSlider
          disabled={false}
          input={withdrawPercent}
          onChange={setWithdrawPercent}
        />
      </div>
      <div tw="flex items-center justify-center self-center">
        <div tw="text-secondary  justify-center items-center flex text-sm border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-white w-0" />
      </div>
      <div tw="flex flex-col gap-2 p-6 pt-3">
        <AssetSelection
          tw=""
          selectedValue={market.pair.baseToken}
          inputValue={
            userBaseAmount
              ?.multiply(withdrawPercent)
              .divide(100)
              .toSignificant(6, { groupSeparator: "," }) ?? "--"
          }
          inputDisabled={true}
        />
        <AssetSelection
          tw=""
          selectedValue={market.pair.speculativeToken}
          inputValue={
            userSpeculativeAmount
              ?.multiply(withdrawPercent)
              .divide(100)
              .toSignificant(6, { groupSeparator: "," }) ?? "--"
          }
          inputDisabled={true}
        />
      </div>
    </div>
  );
};
