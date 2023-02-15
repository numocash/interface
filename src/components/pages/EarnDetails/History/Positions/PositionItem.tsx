import { useMemo } from "react";

import type { Lendgine } from "../../../../../constants";
import type {
  LendgineInfo,
  LendginePosition,
} from "../../../../../hooks/useLendgine";
import { TokenAmountDisplay } from "../../../../common/TokenAmountDisplay";
import { useEarnDetails } from "../..";

type Props<L extends Lendgine = Lendgine> = {
  lendgine: L;
  lendgineInfo: LendgineInfo<L>;
  position: LendginePosition;
};

export const PositionItem: React.FC<Props> = ({
  lendgine,
  lendgineInfo,
  position,
}: Props) => {
  const { base, setSelectedLendgine } = useEarnDetails();
  const isInverse = base.equals(lendgine.token1);

  const { amount0, amount1 } = useMemo(() => {
    const amount0 = lendgineInfo.reserve0
      .multiply(position.size)
      .divide(lendgineInfo.totalPositionSize);

    const amount1 = lendgineInfo.reserve1
      .multiply(position.size)
      .divide(lendgineInfo.totalPositionSize);

    return { amount0, amount1 };
  }, [
    lendgineInfo.reserve0,
    lendgineInfo.reserve1,
    lendgineInfo.totalPositionSize,
    position.size,
  ]);

  return (
    <div
      tw="w-full justify-between grid grid-cols-7 h-12 items-center"
      key={lendgine.address}
    >
      <div tw="  pl-4 col-span-2 flex flex-col gap-1">
        {(isInverse ? [amount1, amount0] : [amount0, amount1]).map((a) => (
          <TokenAmountDisplay
            key={a.currency.address}
            amount={a}
            showIcon
            showSymbol
          />
        ))}
      </div>
      <div tw="col-span-2 flex flex-col gap-1 justify-self-start">
        <TokenAmountDisplay
          tw="col-span-2"
          amount={position.tokensOwed}
          showIcon
          showSymbol
        />
        <button tw="px-2 py-0 rounded-lg bg-blue w-min text-white">
          Collect
        </button>
      </div>

      <p tw="justify-self-start col-span-2">N/A</p>

      <button
        tw="text-red text-lg font-semibold transform ease-in-out duration-300 hover:text-opacity-75 active:scale-90"
        onClick={() => {
          setSelectedLendgine(lendgine);
        }}
      >
        Close
      </button>
    </div>
  );
};
