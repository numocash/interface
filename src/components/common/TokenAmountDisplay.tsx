import type {
  IFormatUint,
  Percent,
  TokenAmount,
} from "@dahlia-labs/token-utils";
import React from "react";
import { css, styled } from "twin.macro";

import { formatDisplayWithSoftLimit, formatPercent } from "../../utils/format";
import { TokenIcon } from "./TokenIcon";

export interface IProps extends IFormatUint {
  amount: TokenAmount;
  isMonoNumber?: boolean;
  showIcon?: boolean;
  percent?: Percent;
  className?: string;
  showSymbol?: boolean;
  suffix?: string;
}

export const TokenAmountDisplay: React.FC<IProps> = ({
  amount,
  isMonoNumber = false,
  showIcon = false,
  showSymbol = true,
  percent,
  className,
  suffix = "",
}: IProps) => {
  return (
    <TokenAmountWrapper className={className}>
      {showIcon && (
        <TokenIcon
          css={css`
            margin-right: 4px;
          `}
          token={amount.token}
        />
      )}
      <TheNumber isMonoNumber={isMonoNumber}>
        {formatDisplayWithSoftLimit(Number(amount.toFixed(2)), 2, 10)}
      </TheNumber>

      {showSymbol && (
        <span>
          {"\u00A0"}
          {amount.token.symbol}
        </span>
      )}
      {percent && <PercentFmt>({formatPercent(percent)})</PercentFmt>}
      {suffix && <span>{suffix}</span>}
    </TokenAmountWrapper>
  );
};

const PercentFmt = styled.span`
  margin-left: 4px;
`;

const TokenAmountWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const TheNumber = styled.span<{ isMonoNumber?: boolean }>`
  ${({ theme, isMonoNumber }) =>
    isMonoNumber === true
      ? css`
          ${theme.mono}
        `
      : undefined}
`;
