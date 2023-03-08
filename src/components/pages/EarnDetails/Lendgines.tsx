/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useMemo } from "react";
import { IoIosArrowDown } from "react-icons/io";
import tw, { styled } from "twin.macro";

import { useLendgine } from "../../../hooks/useLendgine";
import {
  isLongLendgine,
  pickLongLendgines,
  pickShortLendgines,
} from "../../../utils/lendgines";
import {
  nextHighestLendgine,
  nextLowestLendgine,
} from "../../../utils/Numoen/price";
import { useEarnDetails } from "./EarnDetailsInner";
import { LendgineItem } from "./LendgineItem";

export const Lendgines: React.FC = () => {
  const { lendgines, base, selectedLendgine, setSelectedLendgine } =
    useEarnDetails();

  const {
    longLendgine,
    shortLendgine,

    lowerLendgine,
    upperLendgine,
  } = useMemo(() => {
    const longLendgines = pickLongLendgines(lendgines, base);
    const shortLendgines = pickShortLendgines(lendgines, base);

    const opposite = lendgines.find((l) =>
      l.bound.equalTo(selectedLendgine.bound.invert())
    );

    const [longLendgine, shortLendgine] = isLongLendgine(selectedLendgine, base)
      ? [selectedLendgine, opposite]
      : [opposite, selectedLendgine];

    const similarLendgines = isLongLendgine(selectedLendgine, base)
      ? pickLongLendgines(lendgines, base)
      : pickShortLendgines(lendgines, base);

    const oppositeLendgines = isLongLendgine(selectedLendgine, base)
      ? pickShortLendgines(lendgines, base)
      : pickLongLendgines(lendgines, base);

    const nextSameLendgine = nextHighestLendgine({
      lendgine: selectedLendgine,
      lendgines: similarLendgines,
    });

    const lowerSameLendgine = nextLowestLendgine({
      lendgine: selectedLendgine,
      lendgines: similarLendgines,
    });

    const nextOppositeLendgine = nextLowestLendgine({
      price: selectedLendgine.bound.invert(),
      lendgines: oppositeLendgines,
    });

    const lowerOppositeLendgine = nextHighestLendgine({
      price: selectedLendgine.bound.invert(),
      lendgines: oppositeLendgines,
    });

    const lowerLendgine =
      !lowerOppositeLendgine && !lowerSameLendgine
        ? undefined
        : !lowerOppositeLendgine
        ? lowerSameLendgine
        : !lowerSameLendgine
        ? lowerOppositeLendgine
        : lowerSameLendgine?.bound
            .invert()
            .lessThan(lowerOppositeLendgine.bound.invert())
        ? lowerOppositeLendgine
        : lowerSameLendgine;

    const upperLendgine =
      !nextOppositeLendgine && !nextSameLendgine
        ? undefined
        : !nextOppositeLendgine
        ? nextSameLendgine
        : !nextSameLendgine
        ? nextOppositeLendgine
        : nextOppositeLendgine.bound.greaterThan(nextSameLendgine.bound)
        ? nextSameLendgine
        : nextOppositeLendgine;

    return {
      longLendgine,
      shortLendgine,
      longLendgines,
      shortLendgines,
      lowerLendgine,
      upperLendgine,
    };
  }, [base, lendgines, selectedLendgine]);

  const longInfo = useLendgine(longLendgine);
  const shortInfo = useLendgine(shortLendgine);

  return (
    <>
      <div tw="flex flex-col items-center md:flex-row gap-4 w-full justify-around">
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
      <div tw="w-full justify-center flex">
        <div tw="flex items-center gap-6">
          {lowerLendgine && (
            <button
              tw="bg-secondary p-1 rounded-lg items-center justify-center"
              onClick={() => setSelectedLendgine(lowerLendgine)}
            >
              <IoIosArrowDown tw="rotate-90" />
            </button>
          )}

          {upperLendgine && (
            <button tw="bg-secondary p-1 rounded-lg items-center justify-center">
              <IoIosArrowDown
                tw="-rotate-90"
                onClick={() => setSelectedLendgine(upperLendgine)}
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
