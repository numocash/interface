import type { Token } from "@dahlia-labs/token-utils";
import React from "react";
import tw, { styled } from "twin.macro";

import { TokenIcon } from "./TokenIcon";

interface IProps {
  token: Token;
  iconSize?: number;
  className?: string;
  small?: boolean;
  showName?: boolean;
}

export const TokenInfo: React.FC<IProps> = ({
  token,
  iconSize = 30,
  className,
  small = false,
  showName = true,
}: IProps) => (
  <TokenInfoWrapper className={className}>
    {token ? <TokenIcon size={iconSize} token={token} /> : <div />}
    <TokenMeta>
      <div tw="flex items-center">
        <TokenSymbol small={small}>{token?.symbol}</TokenSymbol>
      </div>
      {showName && <TokenName small={small}>{token?.name}</TokenName>}
    </TokenMeta>
  </TokenInfoWrapper>
);

const TokenInfoWrapper = styled.div(() => [tw`flex items-center space-x-4`]);

const TokenMeta = styled.div<{ small?: boolean }>(({ small }) => [
  tw`space-y-1`,
  small && tw`space-y-0`,
]);

const TokenSymbol = styled.div<{ small?: boolean }>(({ small }) => [
  tw`text-xl font-semibold leading-none text-default dark:text-default-d`,
  small && tw`text-base`,
]);

const TokenName = styled.div<{ small?: boolean }>(({ small }) => [
  tw`text-lg text-secondary dark:text-secondary-d`,
  small && tw`text-sm leading-none`,
]);
