import tw, { styled } from "twin.macro";

import type { WrappedTokenInfo } from "../../hooks/useTokens2";
import { TokenIcon } from "./TokenIcon";

type IProps<T extends WrappedTokenInfo> = {
  token: T;
  iconSize?: number;
  className?: string;
  small?: boolean;
  showName?: boolean;
};

export const TokenInfo = <T extends WrappedTokenInfo>({
  token,
  iconSize = 30,
  className,
  small = false,
  showName = true,
}: IProps<T>) => {
  return (
    <TokenInfoWrapper className={className}>
      <TokenIcon size={iconSize} token={token} />
      <TokenMeta>
        <div tw="flex items-center">
          <TokenSymbol small={small}>{token.symbol}</TokenSymbol>
        </div>
        {showName && <TokenName small={small}>{token.name}</TokenName>}
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
