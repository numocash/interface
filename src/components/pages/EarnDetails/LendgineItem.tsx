import { useMemo } from "react";
import tw, { styled } from "twin.macro";

import type { Lendgine, LendgineInfo } from "../../../constants/types";
import { formatPercent } from "../../../utils/format";
import { supplyRate } from "../../../utils/Numoen/jumprate";
import { accruedLendgineInfo } from "../../../utils/Numoen/lendgineMath";
import {
  invert,
  lvrCoef,
  numoenPrice,
  pricePerCollateral,
  pricePerLiquidity,
} from "../../../utils/Numoen/price";
import { RowBetween } from "../../common/RowBetween";
import { TokenAmountDisplay } from "../../common/TokenAmountDisplay";
import { VerticalItem } from "../../common/VerticalItem";
import { useEarnDetails } from "./EarnDetailsInner";

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
    const liquidityPrice = pricePerLiquidity({
      lendgine,
      lendgineInfo: updatedInfo,
    });

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
      tvl: inverse ? invert(price).quote(tvl) : tvl,
      borrowValue: inverse ? invert(price).quote(borrowValue) : borrowValue,
      il,
      iv,
    };
  }, [updatedInfo, inverse, lendgine]);
  return (
    <W
      selected={selectedLendgine === lendgine}
      onClick={() => {
        setSelectedLendgine(lendgine);
        close && setClose(false);
      }}
    >
      <RowBetween tw="px-0">
        <p tw="text-xl text-secondary">APR</p>
        <p tw="text-xl font-semibold">
          {apr.equalTo(0) ? "0%" : formatPercent(apr)}
        </p>
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
        <p tw="text-sm text-secondary">Impermanent loss vs. Uni V2</p>
        <p>{il.equalTo(0) ? "0" : il.toFixed(2)}x</p>
      </RowBetween>
      {/* <div tw="w-full border-b-2 border-stroke" /> */}
      <RowBetween tw="p-0 ">
        <p tw="text-sm  text-secondary">Implied vol.</p>
        <p>{iv.equalTo(0) ? "0" : iv.toFixed(2)}%</p>
      </RowBetween>
    </W>
  );
};

const Wrapper = styled.button<{ selected: boolean }>(({ selected }) => [
  tw`flex flex-col w-full max-w-sm px-4 py-2 duration-300 ease-in-out transform border-2 border-transparent rounded-xl hover:bg-secondary`,
  selected && tw`border-stroke`,
]);

interface WProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}
const W: React.FC<WProps> = ({ selected, onClick, children }: WProps) => {
  const { setModalOpen } = useEarnDetails();
  return (
    <>
      <Wrapper selected={selected} onClick={onClick} tw="hidden xl:flex">
        {children}
      </Wrapper>
      <Wrapper
        selected={false}
        onClick={() => {
          onClick();
          setModalOpen(true);
        }}
        tw="border-0 xl:hidden"
      >
        {children}
      </Wrapper>
    </>
  );
};
