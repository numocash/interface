import React from "react";
import { css } from "twin.macro";

import { ConnectButton } from "./ConnectButton";
import { MoreInfo } from "./MoreInfo";
import { Nav } from "./Nav";
import { Settings } from "./Settings";
// import { Nav } from "./Nav";

export const Header: React.FC = () => {
  return (
    <div
      tw="z-10 fixed bottom-0 md:(top-0 bottom-auto justify-between border-b-2 border-gray-100) w-full flex items-center px-4 py-2 pb-1"
      // from ribbon interface
      css={css`
        backdrop-filter: blur(40px);
        /**
     * Firefox desktop come with default flag to have backdrop-filter disabled
     * Firefox Android also currently has bug where backdrop-filter is not being applied
     * More info: https://bugzilla.mozilla.org/show_bug.cgi?id=1178765
     **/
        @-moz-document url-prefix() {
          background-color: rgba(0, 0, 0, 0.9);
        }
      `}
    >
      <h1 tw="font-bold text-2xl hidden md:flex">Numeon</h1>

      <div tw="flex w-full md:(gap-2 justify-end) items-center justify-between">
        <Nav />
        <Settings />
        <MoreInfo />
        <ConnectButton />
      </div>
    </div>
  );
};
