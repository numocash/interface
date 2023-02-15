import { CurrencyAmount } from "@uniswap/sdk-core";
import { useMemo } from "react";
import tw, { styled } from "twin.macro";

import type { Lendgine } from "../../../constants";
import type { LendgineInfo } from "../../../hooks/useLendgine";
import { supplyRate } from "../../../utils/Numoen/jumprate";
import { liquidityPerCollateral } from "../../../utils/Numoen/lendgineMath";
import { lvrCoef, numoenPrice } from "../../../utils/Numoen/price";
import { RowBetween } from "../../common/RowBetween";
import { TokenAmountDisplay } from "../../common/TokenAmountDisplay";
import { VerticalItem } from "../../common/VerticalItem";
import { useEarnDetails } from ".";

type Props<L extends Lendgine = Lendgine> = {
  lendgine: L;
  info: LendgineInfo<L>;
};

export const LendgineItem: React.FC<Props> = ({ lendgine, info }: Props) => {
  const { base, selectedLendgine, setSelectedLendgine } = useEarnDetails();
  const inverse = base.equals(lendgine.token1);
  const { apr, tvl, borrowValue, il, iv } = useMemo(() => {
    const price = numoenPrice(lendgine, info);
    // liq / token1
    const liqPerCol = liquidityPerCollateral(lendgine);

    // token0 / liq
    const liquidityPrice = liqPerCol.invert().multiply(price);

    const collateralValue = price.quote(
      CurrencyAmount.fromFractionalAmount(
        lendgine.token1,
        lendgine.bound.asFraction.multiply(2).numerator,
        lendgine.bound.asFraction.multiply(2).denominator
      )
    );
    const liquidityValue = liquidityPrice.quote(
      CurrencyAmount.fromFractionalAmount(lendgine.liquidity, 1, 1)
    );

    // token0
    const tvl = liquidityPrice.quote(
      info.totalLiquidity.add(info.totalLiquidityBorrowed)
    );

    const borrowValue = liquidityPrice.quote(info.totalLiquidityBorrowed);

    const interestPremium = collateralValue
      .subtract(liquidityValue)
      .divide(liquidityValue);

    const apr = supplyRate(
      info.totalLiquidity,
      info.totalLiquidityBorrowed
    ).multiply(interestPremium);

    const lvr = lvrCoef(price, lendgine);
    const il = lvr.multiply(8);
    const iv = apr.divide(lvr);
    return {
      apr,
      tvl: inverse ? price.invert().quote(tvl) : tvl,
      borrowValue: inverse ? price.invert().quote(borrowValue) : borrowValue,
      il,
      iv,
    };
  }, [info, inverse, lendgine]);
  return (
    <Wrapper
      selected={selectedLendgine === lendgine}
      onClick={() => setSelectedLendgine(lendgine)}
    >
      <RowBetween tw="px-0">
        <p tw="text-xl">APR</p>
        <p tw="text-xl font-semibold">{apr.toFixed(2)}%</p>
      </RowBetween>
      <RowBetween tw="justify-around">
        <VerticalItem
          label="TVL"
          item={<TokenAmountDisplay amount={tvl} showSymbol />}
        />
        <VerticalItem
          label="Open interest"
          item={<TokenAmountDisplay amount={borrowValue} showSymbol />}
        />
      </RowBetween>
      <RowBetween tw="mt-2 px-0 items-center">
        <p tw="text-sm">Impermanent loss vs. Uni V2</p>
        <p>{il.toFixed(2)}x</p>
      </RowBetween>
      <div tw="w-full border-b-2 border-gray-200" />
      <RowBetween tw="p-0 mt-2">
        <p tw="text-sm items-center">Implied vol.</p>
        <p>{iv.toFixed(2)}%</p>
      </RowBetween>
      <RowBetween tw="p-0">
        <p tw="text-sm items-center">Delta</p>
        <p>{lendgine.bound.asFraction.toSignificant(5)}</p>
      </RowBetween>
      <RowBetween tw="p-0">
        <p tw="text-sm items-center">Gamma</p>
        <p>{lendgine.bound.asFraction.toSignificant(5)}</p>
      </RowBetween>
    </Wrapper>
  );
};

const Wrapper = styled.button<{ selected: boolean }>(({ selected }) => [
  tw`flex flex-col w-full max-w-sm px-4 py-2 duration-300 ease-in-out transform border-2 border-transparent rounded-xl hover:bg-gray-200`,
  selected && tw`border-gray-200`,
]);
