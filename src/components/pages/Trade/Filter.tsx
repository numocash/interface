import { useMemo, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import tw, { styled } from "twin.macro";

import { useToken0s, useToken1s } from "../../../hooks/useTokens";
import { dedupeTokens } from "../../../hooks/useTokens2";
import { Drop } from "../../common/Drop";
import { Module } from "../../common/Module";
import { TokenIcon } from "../../common/TokenIcon";
import { useTrade } from ".";

export const Filter: React.FC = () => {
  const [targetRef, setTargetRef] = useState<HTMLElement | null>(null);
  const [show, setShow] = useState(false);
  const { assets, setAssets } = useTrade();

  const token0s = useToken0s();
  const token1s = useToken1s();

  const allTokensDedupe = useMemo(
    () => dedupeTokens(token0s.concat(token1s)),
    [token0s, token1s]
  );

  // TODO: close drop on click
  return (
    <>
      <Drop
        onDismiss={() => setShow(false)}
        show={show}
        target={targetRef}
        placement={"auto"}
      >
        <Module tw="flex flex-col p-1 gap-1 w-52">
          {allTokensDedupe.map((t) => (
            <FilterItem
              key={t.address}
              selected={assets.includes(t)}
              onClick={() => {
                assets.includes(t)
                  ? setAssets(assets.filter((a) => a !== t))
                  : setAssets(assets.concat(t));
              }}
            >
              <div tw="flex items-center gap-4">
                <TokenIcon token={t} size={32} />
                <p tw="text-xl font-semibold">{t.symbol}</p>
              </div>
              <Check show={assets.includes(t)} />
            </FilterItem>
          ))}
        </Module>
      </Drop>
      <FilterButton onClick={() => !show && setShow(true)} ref={setTargetRef}>
        <p>Asset</p>
        <RotateArrow open={show} />
      </FilterButton>
    </>
  );
};

const FilterItem = styled.button<{ selected: boolean }>(({ selected }) => [
  tw`flex items-center justify-between w-full px-4 py-2 duration-300 ease-in-out transform border-2 border-transparent rounded-lg hover:bg-gray-200`,
  !selected && tw`hover:bg-gray-200`,
  selected && tw`border-gray-200`,
]);

const Check = styled(FiCheck)<{ show: boolean }>(({ show }) => [
  tw`duration-300 ease-in-out transform opacity-0`,
  show && tw`opacity-100`,
]);

export const RotateArrow = styled(IoIosArrowDown)<{ open: boolean }>(
  ({ open }) => [
    tw`transition duration-300 ease-in-out`,
    open && tw`-rotate-180`,
  ]
);

export const FilterButton = styled.button`
  ${tw`flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200`}
`;
