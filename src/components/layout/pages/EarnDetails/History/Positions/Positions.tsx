import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { useLendgines } from "../../../../../../hooks/useLendgines";
import { useLendginesPositions } from "../../../../../../hooks/useLendginesPositions";
import { EmptyPosition } from "../../../../../common/EmptyPosition";
import { Divider } from "../../../Trade/Loading";
import { useEarnDetails } from "../../EarnDetailsInner";
import { PositionItem } from "./PositionItem";

export const Positions: React.FC = () => {
  const { lendgines } = useEarnDetails();
  const { address } = useAccount();

  const lendgineInfos = useLendgines(lendgines);
  const positions = useLendginesPositions(lendgines, address);

  return positions.isLoading ||
    !positions.data ||
    lendgineInfos.isLoading ||
    !lendgineInfos.data ? (
    <div tw="w-full rounded-lg bg-secondary flex animate-pulse transform ease-in-out duration-300 h-12" />
  ) : positions.data.filter((p) => p.size.greaterThan(0)).length === 0 ? (
    <EmptyPosition />
  ) : (
    <>
      <div tw="w-full justify-between bg-secondary rounded-lg font-semibold h-12 items-center grid-cols-7 hidden md:grid">
        <p tw="col-start-3 col-span-2 justify-self-start">Interest</p>
        <p tw="col-start-5 col-span-2 justify-self-start">Reward APR</p>
      </div>
      {positions.data?.map((p, i) => {
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
    </>
  );
};
