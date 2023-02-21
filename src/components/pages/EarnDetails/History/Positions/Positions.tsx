import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import {
  useLendgines,
  useLendginesPosition,
} from "../../../../../hooks/useLendgine";
import { EmptyPosition } from "../../../../common/EmptyPosition";
import { useEarnDetails } from "../../EarnDetailsInner";
import { PositionItem } from "./PositionItem";

export const Positions: React.FC = () => {
  const { lendgines } = useEarnDetails();
  const { address } = useAccount();

  const lendgineInfos = useLendgines(lendgines);
  const positions = useLendginesPosition(lendgines, address);

  return positions.isLoading ||
    !positions.data ||
    lendgineInfos.isLoading ||
    !lendgineInfos.data ? (
    <div tw="w-full rounded-lg bg-gray-200 flex animate-pulse transform ease-in-out duration-300" />
  ) : positions.data.filter((p) => p.size.greaterThan(0)).length === 0 ? (
    <EmptyPosition />
  ) : (
    <>
      <div tw="w-full justify-between bg-gray-200 rounded-lg font-semibold h-12 items-center grid grid-cols-7">
        <p tw="col-start-3 col-span-2 justify-self-start">Interest</p>
        <p tw="col-start-5 col-span-2 justify-self-start">Return</p>
      </div>
      {positions.data?.map((p, i) => {
        if (p.size.equalTo(0)) return null;
        const lendgine = lendgines[i];
        const lendgineInfo = lendgineInfos.data?.[i];

        invariant(lendgine && lendgineInfo);
        return (
          <PositionItem
            key={lendgine.address}
            lendgine={lendgine}
            lendgineInfo={lendgineInfo}
            position={p}
          />
        );
      })}
    </>
  );
};
