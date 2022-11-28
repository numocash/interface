import { css, Global } from "@emotion/react";
import { GlobalStyles as BaseStyles } from "twin.macro";

export const globalStyles = (
  <>
    <BaseStyles />
    <Global
      styles={css`
        body {
          font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
        }
        [data-reach-dialog-overlay] {
          z-index: 999 !important;
        }
      `}
    />
  </>
);
