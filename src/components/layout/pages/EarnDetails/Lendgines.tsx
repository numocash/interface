/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Fraction } from "@uniswap/sdk-core";
import { useMemo, useState } from "react";
import tw, { styled } from "twin.macro";

import { useLendgines } from "../../../../hooks/useLendgines";
import { isLongLendgine } from "../../../../utils/lendgines";
import { priceToFraction } from "../../../../utils/Numoen/price";
import { useEarnDetails } from "./EarnDetailsInner";
import { LendgineItem } from "./LendgineItem";

export const Lendgines: React.FC = () => {
  const { lendgines, base, price } = useEarnDetails();
  const [showMore, setShowMore] = useState(false);

  const { primaryLendgines, secondaryLendgines } = useMemo(() => {
    const sortedLendgines = lendgines.slice().sort((a, b) => {
      const aInverse = !isLongLendgine(a, base);
      const bInverse = !isLongLendgine(b, base);

      const aPriceFraction = priceToFraction(a.bound);
      const bPriceFraction = priceToFraction(b.bound);
      const priceFraction = priceToFraction(price);

      const abs = (a: Fraction, b: Fraction) =>
        a.greaterThan(b) ? a.subtract(b) : b.subtract(a);

      const aDif = aInverse
        ? abs(aPriceFraction.invert(), priceFraction).divide(priceFraction)
        : abs(aPriceFraction, priceFraction).divide(priceFraction);

      const bDif = bInverse
        ? abs(bPriceFraction.invert(), priceFraction).divide(priceFraction)
        : abs(bPriceFraction, priceFraction).divide(priceFraction);

      return aDif > bDif ? 1 : -1;
    });

    const primaryLendgines = sortedLendgines.slice(0, 3);
    const secondaryLendgines = sortedLendgines.slice(3);

    return {
      primaryLendgines,
      secondaryLendgines,
    };
  }, [base, lendgines, price]);

  const lendginesInfo = useLendgines(primaryLendgines);
  const secondaryLendgineInfo = useLendgines(secondaryLendgines);

  return (
    <>
      <div tw="grid grid-cols-1 md:grid-cols-3 items-center  gap-4 w-full ">
        {lendginesInfo.isLoading ||
        !lendginesInfo.data ||
        lendginesInfo.data.length === 0
          ? [...Array(3).keys()].map((i) => <Loading key={i} />)
          : lendginesInfo.data.map((l, i) => (
              <LendgineItem
                lendgine={primaryLendgines[i]!}
                info={l}
                key={primaryLendgines[i]!.address}
              />
            ))}
        {showMore &&
          (secondaryLendgineInfo.isLoading ||
          !secondaryLendgineInfo.data ||
          secondaryLendgineInfo.data.length === 0
            ? [...Array(3).keys()].map((i) => <Loading key={i} />)
            : secondaryLendgineInfo.data.map((l, i) => (
                <LendgineItem
                  lendgine={secondaryLendgines[i]!}
                  info={l}
                  key={secondaryLendgines[i]!.address}
                />
              )))}
      </div>
      {secondaryLendgines.length !== 0 &&
        (!showMore ? (
          <button onClick={() => setShowMore(true)}>
            <p>Show more</p>
          </button>
        ) : (
          <button onClick={() => setShowMore(false)}>
            <p>Show less</p>
          </button>
        ))}
    </>
  );
};

const Loading = styled.div(() => [
  tw`h-32 duration-300 ease-in-out transform rounded-xl animate-pulse`,
]);
