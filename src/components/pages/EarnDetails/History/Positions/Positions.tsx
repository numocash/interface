import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { PositionItem } from "./PositionItem";
import { useLendgines } from "../../../../../hooks/useLendgines";
import { useLendginesPositions } from "../../../../../hooks/useLendginesPositions";
import { EmptyPosition } from "../../../../common/EmptyPosition";
import { Divider } from "../../../Trade/Loading";
import { useEarnDetails } from "../../EarnDetailsInner";

export const Positions: React.FC = () => {
  const { lendgines } = useEarnDetails();
  const { address } = useAccount();

  const lendgineInfos = useLendgines(lendgines);
  const positions = useLendginesPositions(lendgines, address);

  return positions.isLoading ||
    !positions.data ||
    lendgineInfos.isLoading ||
    !lendgineInfos.data ? (
    <div tw="w-full rounded-lg bg-gray-100 flex animate-pulse transform ease-in-out duration-300 h-12" />
  ) : positions.data.filter((p) => p.size.greaterThan(0)).length === 0 ? (
    <EmptyPosition />
  ) : (
    <div tw="flex flex-col">
      <div tw="w-full text-secondary items-center grid-cols-3 sm:grid-cols-7 grid">
        <p tw="col-span-2 justify-self-start">Value</p>
        <p tw="col-span-2 justify-self-start hidden sm:flex">Interest</p>
        <p tw="col-span-2 justify-self-start hidden sm:flex">Reward APR</p>
      </div>
      <div tw="border-b border-gray-200 w-full" />

      {positions.data.map((p, i) => {
        if (p.size.equalTo(0)) return null;
        const lendgine = lendgines[i];
        const lendgineInfo = lendgineInfos.data?.[i];

        invariant(lendgine && lendgineInfo);
        return (
          <>
            <PositionItem
              key={lendgine.address + "pos"}
              lendgine={lendgine}
              lendgineInfo={lendgineInfo}
              position={p}
            />
            {i !== (positions.data?.length ?? 0) - 1 && (
              <Divider tw="mx-0" key={lendgine.address + "div"} />
            )}
          </>
        );
      })}
    </div>
  );
};
