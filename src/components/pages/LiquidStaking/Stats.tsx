import { useMemo } from "react";

import { useEnvironment } from "../../../contexts/useEnvironment";
import { useLendgine } from "../../../hooks/useLendgine";
import { formatPercent } from "../../../utils/format";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { TokenAmountDisplay } from "../../common/TokenAmountDisplay";
import { useLongReturns, useLPReturns } from "./useReturns";
import { useLongValue, useLPValue } from "./useValue";

export const Stats: React.FC = () => {
  const environment = useEnvironment();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const staking = environment.interface.liquidStaking!;

  const longAPR = useLongReturns();
  const lpAPR = useLPReturns();

  const maxAPR = useMemo(
    () =>
      !longAPR.totalAPR || !lpAPR.totalAPR
        ? undefined
        : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        longAPR.totalAPR?.greaterThan(lpAPR.totalAPR)
        ? longAPR.totalAPR
        : lpAPR.totalAPR,
    [longAPR, lpAPR]
  );

  const lendgineInfoQuery = useLendgine(staking.lendgine);
  const longTVL = useLongValue(lendgineInfoQuery.data?.totalSupply);
  const lpTVL = useLPValue(
    lendgineInfoQuery.data
      ? { size: lendgineInfoQuery.data?.totalPositionSize }
      : null
  );

  const tvl = useMemo(
    () =>
      !longTVL.value || !lpTVL.value
        ? undefined
        : longTVL.value?.add(lpTVL.value),
    [longTVL.value, lpTVL.value]
  );

  return (
    <div tw="flex w-full justify-around">
      <Item
        label="Total deposited"
        item={
          tvl ? (
            <TokenAmountDisplay amount={tvl} showSymbol />
          ) : (
            <LoadingSpinner />
          )
        }
      />
      <Item label="Staking APR" item={formatPercent(staking.return)} />
      <Item
        label="Max APR"
        item={maxAPR ? formatPercent(maxAPR) : <LoadingSpinner />}
      />
      {/* <Item label="Balance" item={"0 MATIC"} /> */}
    </div>
  );
};

interface ItemProps {
  label: string;
  item: React.ReactNode;
}

const Item: React.FC<ItemProps> = ({ label, item }: ItemProps) => {
  return (
    <div tw="flex flex-col gap-1 items-center">
      <p tw="text-secondary text-sm">{label}</p>
      <div tw="text-2xl font-semibold">{item}</div>
    </div>
  );
};
