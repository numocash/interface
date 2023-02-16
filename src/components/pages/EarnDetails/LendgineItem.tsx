import { useMemo } from "react";
import tw, { styled } from "twin.macro";

import type { Lendgine, LendgineInfo } from "../../../constants/types";
import { supplyRate } from "../../../utils/Numoen/jumprate";
import { accruedLendgineInfo } from "../../../utils/Numoen/lendgineMath";
import {
  lvrCoef,
  numoenPrice,
  pricePerCollateral,
  pricePerLiquidity,
} from "../../../utils/Numoen/price";
import { RowBetween } from "../../common/RowBetween";
import { TokenAmountDisplay } from "../../common/TokenAmountDisplay";
import { VerticalItem } from "../../common/VerticalItem";
import { useEarnDetails } from ".";

type Props<L extends Lendgine = Lendgine> = {
  lendgine: L;
  info: LendgineInfo<L>;
};

export const LendgineItem: React.FC<Props> = ({ lendgine, info }: Props) => {
  const { base, selectedLendgine, setSelectedLendgine, setClose, close } =
    useEarnDetails();
  const inverse = base.equals(lendgine.token1);

  const updatedInfo = useMemo(
    () => accruedLendgineInfo(lendgine, info),
    [info, lendgine]
  );

  const { apr, tvl, borrowValue, il, iv } = useMemo(() => {
    // token0 / liq
    const liquidityPrice = pricePerLiquidity(lendgine, updatedInfo);

    // col / liq
    const collateralPrice = pricePerCollateral(lendgine, updatedInfo);

    const interestPremium = collateralPrice
      .subtract(liquidityPrice)
      .divide(liquidityPrice);

    const price = numoenPrice(lendgine, updatedInfo);

    // token0
    const tvl = liquidityPrice.quote(
      updatedInfo.totalLiquidity.add(updatedInfo.totalLiquidityBorrowed)
    );

    const borrowValue = liquidityPrice.quote(
      updatedInfo.totalLiquidityBorrowed
    );

    const apr = supplyRate(updatedInfo).multiply(interestPremium);

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
  }, [updatedInfo, inverse, lendgine]);
  return (
    <Wrapper
      selected={selectedLendgine === lendgine}
      onClick={() => {
        setSelectedLendgine(lendgine);
        close && setClose(false);
      }}
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
