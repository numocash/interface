import { css } from "@emotion/react";

import arbLogo from "../../common/images/arbitrum.svg";
import { Module } from "../../common/Module";

export const Notice: React.FC = () => {
  return (
    <Module
      tw="flex items-start gap-2 max-w-lg mb-3 border-0"
      css={css`
        background: radial-gradient(
          182.71% 150.59% at 2.81% 7.69%,
          rgba(90, 190, 170, 0.5) 0%,
          rgba(80, 160, 40, 0.5) 100%
        );
      `}
    >
      <div tw="flex flex-col gap-2">
        <p tw="font-bold text-2xl flex items-center gap-1">
          Numoen is live{" "}
          <span>
            <img src={arbLogo} alt="Arbi" height={36} width={36} />
          </span>
        </p>
        <p tw="">Go long with squared leverage and no liquidations</p>
      </div>
    </Module>
  );
};
