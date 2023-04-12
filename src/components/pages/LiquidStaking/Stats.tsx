import { useLongReturns } from "./useReturns";
import { useEnvironment } from "../../../contexts/useEnvironment";
import { useTotalValue, useValue } from "../../../hooks/useValue";
import { formatPercent } from "../../../utils/format";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { TokenAmountDisplay } from "../../common/TokenAmountDisplay";

export const Stats: React.FC = () => {
  const environment = useEnvironment();
  const staking = environment.interface.liquidStaking!;

  const userValueQuery = useValue(staking.lendgine, "stpmmp");
  const totalValueQuery = useTotalValue(staking.lendgine, "stpmmp");

  const longAPRQuery = useLongReturns();

  return (
    <div tw="flex w-full justify-around">
      <Item
        label="Total deposited"
        item={
          totalValueQuery.value ? (
            <TokenAmountDisplay amount={totalValueQuery.value} showSymbol />
          ) : (
            <LoadingSpinner />
          )
        }
      />
      {/* <Item label="Staking APR" item={formatPercent(staking.return)} /> */}
      <Item
        label="APR"
        item={
          longAPRQuery.status === "success" ? (
            formatPercent(longAPRQuery.data.totalAPR)
          ) : (
            <LoadingSpinner />
          )
        }
      />
      <Item
        label="Balance"
        item={
          userValueQuery.value ? (
            <TokenAmountDisplay amount={userValueQuery.value} showSymbol />
          ) : (
            <LoadingSpinner />
          )
        }
      />
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
