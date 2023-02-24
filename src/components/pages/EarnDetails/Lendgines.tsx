import { useMemo, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import tw, { styled } from "twin.macro";

import { useLendgine } from "../../../hooks/useLendgine";
import {
  pickLongLendgines,
  pickShortLendgines,
} from "../../../utils/lendgines";
import { nextHighestLendgine } from "../../../utils/Numoen/price";
import { useEarnDetails } from "./EarnDetailsInner";
import { LendgineItem } from "./LendgineItem";

export const Lendgines: React.FC = () => {
  const { lendgines, price, base } = useEarnDetails();

  const [boundMultiple, setBoundMultiple] = useState(2);

  const { longLendgine, shortLendgine, longLendgines, shortLendgines } =
    useMemo(() => {
      const longLendgines = pickLongLendgines(lendgines, base);
      const shortLendgines = pickShortLendgines(lendgines, base);
      const longLendgine = nextHighestLendgine({
        price: price.asFraction.multiply(boundMultiple / 2),
        lendgines: longLendgines,
      });
      const shortLendgine = nextHighestLendgine({
        price: price.invert().asFraction.multiply(boundMultiple / 2),
        lendgines: shortLendgines,
      });

      return { longLendgine, shortLendgine, longLendgines, shortLendgines };
    }, [base, boundMultiple, lendgines, price]);

  const longInfo = useLendgine(longLendgine);
  const shortInfo = useLendgine(shortLendgine);

  return (
    <>
      <div tw="flex gap-4 w-full justify-around">
        {!longLendgine ? null : longInfo.isLoading || !longInfo.data ? (
          <Loading />
        ) : (
          <LendgineItem lendgine={longLendgine} info={longInfo.data} />
        )}
        {!shortLendgine ? null : shortInfo.isLoading || !shortInfo.data ? (
          <Loading />
        ) : (
          <LendgineItem lendgine={shortLendgine} info={shortInfo.data} />
        )}
      </div>
      <div tw="w-full justify-center flex mt-4">
        <div tw="flex items-center gap-6">
          {shortLendgine &&
            nextHighestLendgine({
              lendgine: shortLendgine,
              lendgines: shortLendgines,
            }) && (
              <button
                tw="bg-gray-200 p-1 rounded-lg items-center justify-center"
                onClick={() => setBoundMultiple(boundMultiple / 2)}
              >
                <IoIosArrowDown tw="rotate-90" />
              </button>
            )}

          <p tw="flex text-xl gap-1 w-32 justify-center">
            Bound:<span tw="font-semibold"> {boundMultiple}x</span>
          </p>

          {longLendgine &&
            nextHighestLendgine({
              lendgine: longLendgine,
              lendgines: longLendgines,
            }) && (
              <button tw="bg-gray-200 p-1 rounded-lg items-center justify-center">
                <IoIosArrowDown
                  tw="-rotate-90"
                  onClick={() => setBoundMultiple(boundMultiple * 2)}
                />
              </button>
            )}
        </div>
      </div>
    </>
  );
};

const Loading = styled.div(() => [
  tw`duration-300 ease-in-out transform rounded-xl animate-pulse`,
]);
