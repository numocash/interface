import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";
import { NavLink } from "react-router-dom";

import numoenSmall from "../../../common/images/numoen-small.svg";
import { Nav } from "./Nav";

export const Header: React.FC = () => {
  return (
    <div tw="relative flex items-center justify-between py-4 md:mt-4">
      <div tw="z-50 flex items-center">
        <div tw="flex items-center gap-2">
          <img src={numoenSmall} alt="nl" tw="h-10" />
          <NavLink to="/">
            <div tw="flex gap-2 font-bold text-xl text-default">Numoen</div>
          </NavLink>
        </div>
      </div>

      <Nav />

      <div tw="flex justify-end items-center z-20 space-x-2">
        <ConnectButton chainStatus="full" />
      </div>
    </div>
  );
};
