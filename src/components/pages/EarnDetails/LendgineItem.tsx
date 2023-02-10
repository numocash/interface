import { useMemo } from "react";
import tw, { styled } from "twin.macro";

import type { Lendgine } from "../../../constants";
import type { LendgineInfo } from "../../../hooks/useLendgine";
import { numoenPrice } from "../../../utils/Numoen/price";
import { RowBetween } from "../../common/RowBetween";
import { useEarnDetails } from ".";

interface Props {
  lendgine: Lendgine;
  info: LendgineInfo;
}

export const LendgineItem: React.FC<Props> = ({ lendgine, info }: Props) => {
  const { selectedLendgine, setSelectedLendgine } = useEarnDetails();
  useMemo(() => {
    const price = numoenPrice(lendgine, info);
    console.log(price.toSignificant(5));
  }, [info, lendgine]);
  return (
    <Wrapper
      selected={selectedLendgine === lendgine}
      onClick={() => setSelectedLendgine(lendgine)}
    >
      <RowBetween>
        <p>APR</p>
        <p>9%</p>
      </RowBetween>
      <RowBetween>
        <p>Open Interest</p>
        <p>9%</p>
      </RowBetween>
      <RowBetween>
        <p>TVL</p>
        <p>9%</p>
      </RowBetween>
      <RowBetween>
        <p>Impermanent loss vs UniV2</p>
        <p>9%</p>
      </RowBetween>
      <RowBetween>
        <p>Delta</p>
        <p>9%</p>
      </RowBetween>
      <RowBetween>
        <p>Gamma</p>
        <p>9%</p>
      </RowBetween>
      <RowBetween>
        <p>Bound</p>
        <p>{lendgine.bound.asFraction.toSignificant(5)}</p>
      </RowBetween>
    </Wrapper>
  );
};

const Wrapper = styled.button<{ selected: boolean }>(({ selected }) => [
  tw`flex flex-col px-4 py-2 duration-300 ease-in-out transform border-2 border-transparent rounded-xl hover:bg-gray-200`,
  selected && tw`border-gray-200`,
]);
