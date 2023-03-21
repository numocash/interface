import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { useBalances } from "../../../../../hooks/useBalances";
import { useLendgines } from "../../../../../hooks/useLendgines";
import { EmptyPosition } from "../../../../common/EmptyPosition";
import { Divider } from "../../../Trade/Loading";
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

  return !balances.data || !lendgineInfos.data ? (
    <div tw="w-full rounded-lg bg-gray-100 flex animate-pulse transform ease-in-out duration-300 h-12" />
  ) : !address || balances.data.filter((b) => b.greaterThan(0)).length === 0 ? (
    <EmptyPosition />
  ) : (
    <div tw="flex flex-col">
      <div tw="w-full text-secondary items-center grid-cols-6 hidden md:grid">
        <p tw="col-start-2 col-span-2 justify-self-start">Value</p>
        <p tw="col-start-4 col-span-1 justify-self-start">Funding APR</p>
      </div>
      <div tw="border-b border-gray-200 w-full" />
      {balances.data?.map((d, i) => {
        if (d.equalTo(0)) return null;
        const lendgine = lendgines?.[i];
        const lendgineInfo = lendgineInfos.data?.[i];
        invariant(lendgine && lendgineInfo);
        return (
          <>
            <PositionItem
              balance={d}
              lendgine={lendgine}
              lendgineInfo={lendgineInfo}
            />
            {i !== (balances.data?.length ?? 0) - 1 && <Divider tw="mx-0" />}
          </>
        );
      })}
    </div>
  );
};
