import { useState } from "react";
import { IoIosArrowDown, IoIosMore } from "react-icons/io";
import { NavLink } from "react-router-dom";

import { Drop } from "../../common/Drop";
import { Module } from "../../common/Module";
import { MoreInner } from "./MoreInfo";
import { SettingsInner } from "./Settings";

export const More: React.FC = () => {
  const [show, setShow] = useState(false);
  const [targetRef, setTargetRef] = useState<HTMLElement | null>(null);

  const [showMore, setShowMore] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  return (
    <>
      <Drop
        onDismiss={() => setShow(false)}
        show={show}
        target={targetRef}
        placement={"bottom-start"}
        tw="w-full px-4"
      >
        <Module tw="px-4 py-2 gap-2 rounded-2xl bg-[#303030] w-full md:hidden flex flex-col">
          <NavLink
            tw="text-white hover:opacity-80 w-full"
            to="/trade/"
            onClick={() => setShow(false)}
          >
            <p>Trade</p>
          </NavLink>
          <div tw="border-b border-[#505050] w-full" />

          <NavLink
            tw="text-white hover:opacity-80 w-full"
            to="/earn/"
            onClick={() => setShow(false)}
          >
            <p>Earn</p>
          </NavLink>
          <div tw="border-b border-[#505050] w-full" />

          <div tw="w-full gap-2 flex flex-col ">
            <button
              tw="w-full justify-between flex items-center"
              onClick={() => setShowMore(!showMore)}
            >
              <p tw="text-white">More</p>
              <IoIosArrowDown tw="text-white opacity-80 -rotate-90" />
            </button>
            {showMore && <MoreInner />}
          </div>
          <div tw="border-b border-[#505050] w-full" />

          <div tw="w-full gap-2 flex flex-col ">
            <button
              tw="w-full justify-between flex items-center"
              onClick={() => setShowSettings(!showSettings)}
            >
              <p tw="text-white">Settings</p>
              <IoIosArrowDown tw="text-white opacity-80 -rotate-90" />
            </button>
            {showSettings && <SettingsInner />}
          </div>
        </Module>
      </Drop>
      <button
        tw="p-1.5 bg-[#4f4f4f] rounded-xl text-white  md:hidden"
        ref={setTargetRef}
        onClick={() => setShow(true)}
      >
        <IoIosMore tw="w-[30px] h-[30px]" />
      </button>
    </>
  );
};
