import { NavLink } from "react-router-dom";

import { Module } from "../../common/Module";
import { Swap } from "./Swap";
import { SwapStateProvider } from "./useSwapState";

export const Trade: React.FC = () => {
  return (
    <div tw="flex flex-col gap-4">
      <Module tw="w-full flex max-w-lg flex-col gap-2 border-2 border-red-500">
        <div tw="font-semibold text-lg text-default">
          Warning: Alpha Version{" "}
          <span tw="font-normal text-secondary">v0.2.0</span>
        </div>
        <span tw="text-default">
          This program is to be considered experimental. Contracts used have
          been submitted to{" "}
          <NavLink tw="underline" to="https://www.certik.com/projects/numoen">
            audit
          </NavLink>
          .
        </span>
      </Module>
      <SwapStateProvider>
        <Swap />
      </SwapStateProvider>
    </div>
  );
};
