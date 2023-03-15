import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { objectKeys } from "ts-extras";

import { Check, FilterButton, FilterItem, X } from "../../../common/Filter";
import { Modal } from "../../../common/Modal";
import { Module } from "../../../common/Module";
import { useTrade } from ".";

export const Sorts = {
  default: "Default",
  change: "24h change",
  // tvl: "Total value locked",
} as const;

export const Sort: React.FC = () => {
  const [show, setShow] = useState(false);
  const { sort, setSort } = useTrade();
  return (
    <>
      <Modal onDismiss={() => setShow(false)} isOpen={show}>
        <Module tw="flex flex-col p-1 gap-1 w-full">
          <div tw="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-t-lg text-xl font-semibold w-full justify-between">
            <p>Select asset</p>
            <button onClick={() => setShow(false)}>
              <X />
            </button>
          </div>
          {objectKeys(Sorts).map((t) => (
            <FilterItem
              key={t}
              selected={sort === t}
              onClick={() => {
                sort === t ? setSort("default") : setSort(t);
              }}
            >
              <div tw="flex items-center gap-4">
                <p tw="text-lg font-semibold">{Sorts[t]}</p>
              </div>
              <Check show={sort === t} />
            </FilterItem>
          ))}
        </Module>
      </Modal>
      <FilterButton onClick={() => setShow(!show)}>
        <p>{sort === "default" ? "Sort by" : Sorts[sort]}</p>
        <IoIosArrowDown />
      </FilterButton>
    </>
  );
};
