import { CurrencyAmount } from "@uniswap/sdk-core";
import { useMemo } from "react";
import invariant from "tiny-invariant";

import { calculateSupplyRate } from "../../../../../lib/jumprate";
import {
  accruedLendgineInfo,
  accruedLendginePositionInfo,
  getT,
  liquidityPerPosition,
} from "../../../../../lib/lendgineMath";
import { isLongLendgine } from "../../../../../lib/lendgines";
import {
  calculateQuotePrice,
  invert,
  pricePerCollateral,
  pricePerLiquidity,
} from "../../../../../lib/price";
import type {
  Lendgine,
  LendgineInfo,
  LendginePosition,
} from "../../../../../lib/types/lendgine";
import { Beet } from "../../../../../utils/beet";
import { formatPercent } from "../../../../../utils/format";
import { AsyncButton } from "../../../../common/AsyncButton";
import { Button } from "../../../../common/Button";
import { TokenAmountDisplay } from "../../../../common/TokenAmountDisplay";
import { useEarnDetails } from "../../EarnDetailsInner";
import { useCollect } from "../../TradeColumn/useCollect";

type Props<L extends Lendgine = Lendgine> = {
  lendgine: L;
  lendgineInfo: LendgineInfo<L>;
  position: LendginePosition<L>;
};

export const PositionItem: React.FC<Props> = ({
  lendgine,
  lendgineInfo,
  position,
}: Props) => {
  const { base, setSelectedLendgine, setClose } = useEarnDetails();
  const t = getT();

  const collect = useCollect({ lendgine, lendgineInfo, position });

  const { updatedLendgineInfo, updatedPositionInfo } = useMemo(
    () => ({
      updatedLendgineInfo: accruedLendgineInfo(lendgine, lendgineInfo, t),
      updatedPositionInfo: accruedLendginePositionInfo(
        accruedLendgineInfo(lendgine, lendgineInfo, t),
        position
      ),
    }),
    [lendgine, lendgineInfo, position, t]
  );

  const { apr } = useMemo(() => {
    // token0 / liq
    const liquidityPrice = pricePerLiquidity({
      lendgine,
      lendgineInfo: updatedLendgineInfo,
    });

    // col / liq
    const collateralPrice = pricePerCollateral(lendgine, updatedLendgineInfo);

    const interestPremium = collateralPrice
      .subtract(liquidityPrice)
      .divide(liquidityPrice);

    return {
      apr: calculateSupplyRate(updatedLendgineInfo).multiply(interestPremium),
    };
  }, [lendgine, updatedLendgineInfo]);

  const { value } = useMemo(() => {
    // liq / size
    const liqPerPosition = liquidityPerPosition(lendgine, updatedLendgineInfo);

    // token0 / liq
    const liquidityPrice = pricePerLiquidity({
      lendgine,
      lendgineInfo: updatedLendgineInfo,
    });

    // token0 / token1
    const price = calculateQuotePrice(lendgine, updatedLendgineInfo);

    // token0
    const value = liqPerPosition
      .multiply(liquidityPrice)
      .quote(updatedPositionInfo.size);

    const amount0 = updatedLendgineInfo.totalLiquidity.greaterThan(0)
      ? updatedLendgineInfo.reserve0
          .multiply(liqPerPosition.quote(position.size))
          .divide(updatedLendgineInfo.totalLiquidity)
      : CurrencyAmount.fromRawAmount(updatedLendgineInfo.reserve0.currency, 0);

    const amount1 = updatedLendgineInfo.totalLiquidity.greaterThan(0)
      ? updatedLendgineInfo.reserve1
          .multiply(liqPerPosition.quote(position.size))
          .divide(updatedLendgineInfo.totalLiquidity)
      : CurrencyAmount.fromRawAmount(updatedLendgineInfo.reserve1.currency, 0);

    return {
      amount0,
      amount1,
      value: isLongLendgine(lendgine, base)
        ? value
        : invert(price).quote(value),
    };
  }, [
    base,
    lendgine,
    position.size,
    updatedLendgineInfo,
    updatedPositionInfo.size,
  ]);

  return (
    <div tw="w-full grid grid-cols-2 sm:grid-cols-7 items-center py-3">
      <TokenAmountDisplay
        amount={value}
        showSymbol
        tw="sm:col-span-2 w-full "
      />
      <TokenAmountDisplay
        tw="col-span-2  w-full hidden sm:flex"
        amount={updatedPositionInfo.tokensOwed}
        showIcon
        showSymbol
      />
      <p tw="justify-self-start col-span-1 hidden sm:flex">
        {formatPercent(apr)}
      </p>

      <div tw="grid grid-cols-2 gap-2 sm:col-span-2 w-full justify-self-end">
        <AsyncButton
          variant="primary"
          tw="sm:(text-lg font-semibold) py-0.5"
          disabled={updatedPositionInfo.tokensOwed.equalTo(0)}
          onClick={async () => {
            invariant(collect.data);
            await Beet(collect.data);
          }}
        >
          Collect
        </AsyncButton>
        <Button
          variant="danger"
          tw="sm:(text-lg font-semibold) py-0.5"
          onClick={() => {
            setSelectedLendgine(lendgine);
            setClose(true);
          }}
        >
          Close
        </Button>
      </div>
    </div>
  );
};
