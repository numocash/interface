import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";
import { NavLink } from "react-router-dom";

export const Header: React.FC = () => {
  return (
    <div tw="relative flex items-center justify-between py-4 md:mt-4">
      <div tw="z-50 flex items-center">
        <div tw="flex items-center">
          <NavLink to="/">
            <div tw="flex gap-2 font-bold text-2xl text-default">
              Web3 Template
            </div>
          </NavLink>
        </div>
      </div>

      <div tw="flex justify-end items-center z-20 space-x-2">
        <ConnectButton />
      </div>
    </div>
  );
};
