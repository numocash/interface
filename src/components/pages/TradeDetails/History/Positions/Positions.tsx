import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { useBalances } from "../../../../../hooks/useBalance";
import { useLendgines } from "../../../../../hooks/useLendgine";
import { EmptyPosition } from "../../../../common/EmptyPosition";
import { useTradeDetails } from "../../TradeDetailsInner";
import { PositionItem } from "./PositionItem";

export const Positions: React.FC = () => {
  const { lendgines } = useTradeDetails();
  const { address } = useAccount();
  const balances = useBalances(
    lendgines?.map((l) => l.lendgine),
    address
  );
  const lendgineInfos = useLendgines(lendgines);

  return balances.isLoading ||
    !balances.data ||
    lendgineInfos.isLoading ||
    !lendgineInfos.data ? (
    <div tw="w-full rounded-lg bg-secondary flex animate-pulse transform ease-in-out duration-300 h-12" />
  ) : !address || balances.data.filter((b) => b.greaterThan(0)).length === 0 ? (
    <EmptyPosition />
  ) : (
    <>
      <div tw="w-full justify-between bg-secondary rounded-lg font-semibold h-12 items-center grid grid-cols-9">
        <p tw="col-start-3 col-span-2 justify-self-start">Bound</p>
        <p tw="col-start-5 col-span-2 justify-self-start">Value</p>
        <p tw="col-start-7 col-span-2 justify-self-start">Return</p>
      </div>
      {balances.data?.map((d, i) => {
        if (d.equalTo(0)) return null;
        const lendgine = lendgines?.[i];
        const lendgineInfo = lendgineInfos.data?.[i];
        invariant(lendgine && lendgineInfo);
        return (
          <PositionItem
            key={lendgine.address}
            balance={d}
            lendgine={lendgine}
            lendgineInfo={lendgineInfo}
          />
        );
      })}
    </>
  );
};
