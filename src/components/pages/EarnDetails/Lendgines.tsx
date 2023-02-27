import { useMemo, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import tw, { styled } from "twin.macro";

import { useLendgine } from "../../../hooks/useLendgine";
import {
  pickLongLendgines,
  pickShortLendgines,
} from "../../../utils/lendgines";
import {
  fractionToPrice,
  nextHighestLendgine,
  nextLowestLendgine,
  priceToFraction,
} from "../../../utils/Numoen/price";
import { useEarnDetails } from "./EarnDetailsInner";
import { LendgineItem } from "./LendgineItem";

export const Lendgines: React.FC = () => {
  const { lendgines, price, base } = useEarnDetails();

  const [boundMultiple, setBoundMultiple] = useState(2);

  const { longLendgine, shortLendgine, upEnable, downEnable } = useMemo(() => {
    const longLendgines = pickLongLendgines(lendgines, base);
    const shortLendgines = pickShortLendgines(lendgines, base);
    const longLendgine = nextHighestLendgine({
      price: fractionToPrice(
        priceToFraction(price).multiply(boundMultiple / 2),
        price.baseCurrency,
        price.quoteCurrency
      ),
      lendgines: longLendgines,
    });
    const shortLendgine = nextHighestLendgine({
      price: fractionToPrice(
        priceToFraction(price.invert()).multiply(boundMultiple / 2),
        price.quoteCurrency,
        price.baseCurrency
      ),
      lendgines: shortLendgines,
    });

    const upEnable =
      !!nextHighestLendgine({
        price: fractionToPrice(
          priceToFraction(price).multiply(boundMultiple),
          price.baseCurrency,
          price.quoteCurrency
        ),
        lendgines: longLendgines,
      }) ||
      !!nextHighestLendgine({
        price: fractionToPrice(
          priceToFraction(price.invert()).multiply(boundMultiple),
          price.quoteCurrency,
          price.baseCurrency
        ),
        lendgines: shortLendgines,
      });

    const downEnable =
      !!nextLowestLendgine({
        price: fractionToPrice(
          priceToFraction(price).multiply(boundMultiple / 2),
          price.baseCurrency,
          price.quoteCurrency
        ),
        lendgines: longLendgines,
      }) ||
      !!nextLowestLendgine({
        price: fractionToPrice(
          priceToFraction(price.invert()).multiply(boundMultiple / 2),
          price.quoteCurrency,
          price.baseCurrency
        ),
        lendgines: shortLendgines,
      });

    return {
      longLendgine,
      shortLendgine,
      longLendgines,
      shortLendgines,
      upEnable,
      downEnable,
    };
  }, [base, boundMultiple, lendgines, price]);

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
          {downEnable && (
            <button
              tw="bg-secondary p-1 rounded-lg items-center justify-center"
              onClick={() => setBoundMultiple(boundMultiple / 2)}
            >
              <IoIosArrowDown tw="rotate-90" />
            </button>
          )}

          <p tw="flex text-xl gap-1 w-32 justify-center">
            Bound:<span tw="font-semibold"> {boundMultiple}x</span>
          </p>

          {upEnable && (
            <button tw="bg-secondary p-1 rounded-lg items-center justify-center">
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
