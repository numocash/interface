import { css } from "@emotion/react";

import arbLogo from "../../common/images/arbitrum.svg";
import { Module } from "../../common/Module";

export const Arbitrum: React.FC = () => {
  return (
    <Module
      tw="  max-w-lg"
      css={css`
        background: radial-gradient(
            285% 8200% at 30% 50%,
            rgba(40, 160, 240, 0.1) 0%,
            rgba(219, 255, 0, 0) 100%
          ),
          radial-gradient(
            circle at top left,
            hsla(206, 50%, 75%, 0.01),
            hsla(215, 79%, 51%, 0.12)
          ),
          hsla(0, 0%, 100%, 0.1);
      `}
    >
      <div tw="flex items-start gap-2">
        <img src={arbLogo} alt="arbitrum" height={36} width={36} />
        <div tw="flex flex-col">
          <p tw="font-bold text-2xl">Numoen is live on Arbitrum</p>
          <p>
            Numoen is bringing permissionless options to Arbitrum. Check out our
            launch calendar to see what is next.
          </p>
        </div>
      </div>
    </Module>
  );
};
