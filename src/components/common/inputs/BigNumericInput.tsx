import React from "react";
import tw, { styled } from "twin.macro";

import { breakpoints } from "../../../theme/breakpoints";

interface IProps
  extends Omit<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    "onChange"
  > {
  onChange?: (val: string) => void;
  hasBackground?: boolean;
  integerOnly?: boolean;
}

const DIGIT_ONLY = /^(\d)*$/;
const DECIMAL_ONLY = /^-?\d*(\.\d*)?$/;

export const BigNumericInput: React.FC<IProps> = ({
  onChange,
  integerOnly,
  ...rest
}: IProps) => (
  <StyledInput
    {...rest}
    inputMode="decimal"
    autoComplete="off"
    autoCorrect="off"
    type="text"
    spellCheck="false"
    // style={{ borderWidth: "0px" }}
    onChange={(e) => {
      const { value } = e.target;
      if (integerOnly) {
        if (
          value === "" ||
          (DIGIT_ONLY.test(value) && !Number.isNaN(parseInt(value)))
        ) {
          onChange?.(value);
        }
        return;
      }
      if (
        (!Number.isNaN(value) && DECIMAL_ONLY.test(value)) ||
        value === "" ||
        value === "-"
      ) {
        onChange?.(value);
      }
    }}
  />
);

// TODO: global css is setting with width to 1px
const StyledInput = styled.input<{
  hasBackground?: boolean;
  disabled?: boolean;
}>`
  outline: none;
  &:active {
    border: none;
    outline: none;
  }
  border: none;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;

  ${tw` text-[#8f8f8f]`}

  &:placeholder {
    color: #888;
  }

  padding: 0px;

  ${breakpoints.mobile} {
    font-size: 20px;
  }
`;
