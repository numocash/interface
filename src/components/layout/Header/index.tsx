import React from "react";
import { css } from "twin.macro";

import { ReactComponent as Numoen } from "../../common/images/numoen-small.svg";
import { ConnectButton } from "./ConnectButton";
import { MoreInfo } from "./MoreInfo";
import { Nav } from "./Nav";
import { Settings } from "./Settings";
// import { Nav } from "./Nav";

export const Header: React.FC = () => {
  return (
    <>
      <div
        tw="z-10 md:fixed top-0 bottom-auto justify-between bg-background md:bg-transparent md:(border-b-2 border-stroke) w-full flex items-center px-4 py-2 pb-1"
        // from ribbon interface
        css={css`
          @media (min-width: 768px) {
            backdrop-filter: blur(40px);
            /**
     * Firefox desktop come with default flag to have backdrop-filter disabled
     * Firefox Android also currently has bug where backdrop-filter is not being applied
     * More info: https://bugzilla.mozilla.org/show_bug.cgi?id=1178765
     **/
            @-moz-document url-prefix() {
              background-color: rgba(0, 0, 0, 0.9);
            }
          }
        `}
      >
        <div tw="flex space-x-[-16px] items-center">
          <Numoen tw="h-8" />
          <h1 tw="font-bold text-2xl hidden md:flex">Numoen</h1>
        </div>

        <div tw="flex w-full  gap-2 items-center justify-end">
          <Nav tw="hidden md:flex" />
          <Settings tw="hidden md:flex" />
          <MoreInfo tw="hidden md:flex" />
          <ConnectButton tw="" />
        </div>
      </div>
      <div
        tw="z-10 fixed bottom-0 border-t-2 border-stroke justify-between  md:(hidden) w-full flex items-center px-4 py-2 pb-1"
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
        <Nav tw="" />
        <Settings tw="" />
        <MoreInfo tw="" />
      </div>
    </>
  );
};
