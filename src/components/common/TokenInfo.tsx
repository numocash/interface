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
}: IProps) => {
  // TODO: handle ETH
  const displayToken = token;

  return (
    <TokenInfoWrapper className={className}>
      <TokenIcon size={iconSize} token={displayToken} />
      <TokenMeta>
        <div tw="flex items-center">
          <TokenSymbol small={small}>{displayToken.symbol}</TokenSymbol>
        </div>
        {showName && <TokenName small={small}>{displayToken.name}</TokenName>}
      </TokenMeta>
    </TokenInfoWrapper>
  );
};

const TokenInfoWrapper = styled.div(() => [tw`flex items-center space-x-4`]);

const TokenMeta = styled.div<{ small?: boolean }>(({ small }) => [
  tw`space-y-1`,
  small && tw`space-y-0`,
]);

const TokenSymbol = styled.div<{ small?: boolean }>(({ small }) => [
  tw`text-xl font-semibold leading-none text-default `,
  small && tw`text-base`,
]);

const TokenName = styled.div<{ small?: boolean }>(({ small }) => [
  tw`text-lg text-secondary `,
  small && tw`text-sm leading-none`,
]);
