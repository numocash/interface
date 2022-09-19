import { css, Global } from "@emotion/react";
import tw, { GlobalStyles as BaseStyles } from "twin.macro";

export const globalStyles = (
  <>
    <BaseStyles />
    <Global
      styles={css`
        body {
          ${tw`font-sans antialiased text-white`}
        }
        [data-reach-dialog-overlay] {
          z-index: 999 !important;
        }
      `}
    />
  </>
);
