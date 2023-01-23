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

const StyledInput = styled.input<{
  hasBackground?: boolean;
  disabled?: boolean;
}>`
  ${tw`border-none focus:border-none `}
  color: ${({ theme }) => theme.colors.text.bold};
  font-weight: 400;
  font-size: 24px;
  &:disabled {
    color: ${({ theme }) => theme.colors.text.default};
  }
  &::placeholder {
    color: #888;
  }
  padding-right: 8px;
  padding-left: 2px;
  &:focus {
    outline: none;
  }

  ${(props) => !!props.disabled && tw`bg-gray-100 `}

  ${breakpoints.mobile} {
    font-size: 20px;
  }
`;
