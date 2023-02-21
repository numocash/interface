import tw, { styled } from "twin.macro";

import { useLendgines } from "../../../hooks/useLendgine";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { useEarnDetails } from "./EarnDetailsInner";
import { LendgineItem } from "./LendgineItem";

export const Lendgines: React.FC = () => {
  const { lendgines } = useEarnDetails();

  const lendgineInfos = useLendgines(lendgines);

  return lendgineInfos.isLoading ? (
    <LoadingSpinner />
  ) : (
    <div tw="flex gap-4 w-full justify-around">
      {lendgines.map((l, i) => {
        const info = lendgineInfos?.data?.[i];

        return !info ? (
          <Loading key={l.address} />
        ) : (
          <LendgineItem key={l.address} lendgine={l} info={info} />
        );
      })}
    </div>
  );
};

const Loading = styled.div(() => [
  tw`duration-300 ease-in-out transform rounded-xl animate-pulse`,
]);
