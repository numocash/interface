import { useMemo } from "react";
import tw, { styled } from "twin.macro";

import { supplyRate } from "../../../lib/jumprate";
import { accruedLendgineInfo, getT } from "../../../lib/lendgineMath";
import {
  invert,
  numoenPrice,
  pricePerCollateral,
  pricePerLiquidity,
} from "../../../lib/price";
import { lvrCoef } from "../../../lib/stats";
import type { Lendgine, LendgineInfo } from "../../../lib/types/lendgine";
import { formatPercent } from "../../../utils/format";
import { RowBetween } from "../../common/RowBetween";
import { TokenAmountDisplay } from "../../common/TokenAmountDisplay";
import { useEarnDetails } from "./EarnDetailsInner";

type Props<L extends Lendgine = Lendgine> = {
  lendgine: L;
  info: LendgineInfo<L>;
};

export const LendgineItem: React.FC<Props> = ({ lendgine, info }: Props) => {
  const { base, selectedLendgine, setSelectedLendgine, setClose, close } =
    useEarnDetails();
  const inverse = base.equals(lendgine.token1);
  const t = getT();

  const updatedInfo = useMemo(
    () => accruedLendgineInfo(lendgine, info, t),
    [info, lendgine, t]
  );

  const { apr, tvl, il, iv } = useMemo(() => {
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

    const apr = supplyRate(updatedInfo).multiply(interestPremium);

    const lvr = lvrCoef(price, lendgine);
    const il = lvr.multiply(8);
    const iv = apr.divide(lvr);
    return {
      apr,
      tvl: inverse ? invert(price).quote(tvl) : tvl,
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
      <div tw="bg-secondary w-full flex h-16 items-center p-2">
        <div tw="flex flex-col ">
          <p tw="text-sm text-secondary">Best APR</p>
          <p tw="text-2xl font-semibold">
            {apr.equalTo(0) ? "0%" : formatPercent(apr)}
          </p>
        </div>
      </div>

      <RowBetween tw="px-2 py-1 pt-2 items-center">
        <p tw="">TVL</p>
        <TokenAmountDisplay amount={tvl} showSymbol />
      </RowBetween>
      <RowBetween tw="px-2 py-1  items-center">
        <p tw="text-sm text-secondary">Impermanent loss vs. Uni V2</p>
        <p>{il.equalTo(0) ? "0" : il.toFixed(2)}x</p>
      </RowBetween>
      {/* <div tw="w-full border-b-2 border-stroke" /> */}
      <RowBetween tw="px-2 py-1  ">
        <p tw="text-sm  text-secondary">Implied vol.</p>
        <p>{iv.equalTo(0) ? "0" : iv.toFixed(2)}%</p>
      </RowBetween>
    </W>
  );
};

const Wrapper = styled.button<{ selected: boolean }>(({ selected }) => [
  tw`flex flex-col w-full max-w-sm duration-300 ease-in-out transform border-2 border-transparent rounded-xl sm:hover:scale-105 overflow-clip border-secondary`,
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
        tw="border-secondary xl:hidden"
      >
        {children}
      </Wrapper>
    </>
  );
};
