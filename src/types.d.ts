import "twin.macro";

import type { css as cssImport } from "@emotion/react";
import type { CSSInterpolation } from "@emotion/serialize";
import type styledImport from "@emotion/styled";

declare module "twin.macro" {
  // The styled and css imports
  const styled: typeof styledImport;
  const css: typeof cssImport;
}

declare module "react" {
  // The css prop
  interface HTMLAttributes<T> extends DOMAttributes<T> {
    css?: CSSInterpolation;
    ref?: LegacyRef<T>;
    as?: React.ElementType; // 👈 modified
  }
  // The inline svg css prop
  interface SVGProps extends SVGProps<SVGSVGElement> {
    css?: CSSInterpolation;
  }
}
