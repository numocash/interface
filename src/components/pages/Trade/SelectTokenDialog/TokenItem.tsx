import type { Token, TokenAmount } from "@dahlia-labs/token-utils";
import type { CSSProperties } from "react";
import React from "react";
import tw, { styled } from "twin.macro";

import { useAddressToMarket } from "../../../../contexts/environment";
import { ChartIcons } from "../../../common/ChartIcons";
import { TokenIcon } from "../../../common/TokenIcon";
import { TokenInfo } from "../../../common/TokenInfo";

const Balance = styled.div(() => [tw`text-base text-secondary`]);

const TokenOption = styled.div(() => [
  tw`flex items-center justify-between w-full`,
  tw`cursor-pointer`,
]);

const Wrapper = styled.div<{ disabled?: boolean }>(({ disabled }) => [
  tw`px-4 flex hover:(bg-action)`,
  disabled && tw`opacity-50 pointer-events-none`,
]);

interface Props {
  onClick?: () => void;
  token: Token;
  amount: TokenAmount;
  style?: CSSProperties;
  isSelected?: boolean;
}

export const TokenItem: React.FC<Props> = ({
  onClick,
  token,
  amount,
  style,
  isSelected,
}) => {
  const market = useAddressToMarket(token.address);

  return (
    <Wrapper style={style} onClick={onClick} disabled={isSelected || !onClick}>
      <TokenOption>
        {!market ? (
          <TokenInfo iconSize={24} small token={token} />
        ) : (
          <div tw="flex items-center space-x-2">
            <div tw="flex flex-col">
              <div tw="flex items-center space-x-2">
                <TokenIcon size={24} token={market.pair.speculativeToken} />
                <div tw=" space-y-1">
                  <div tw="text-lg font-semibold leading-none">
                    {market.pair.speculativeToken.symbol}²
                  </div>
                  {/* <img tw="h-[50px] w-[65px]" src={power} alt={`power`} /> */}
                </div>
                <div tw="flex  gap-1">
                  <ChartIcons
                    chart="up"
                    token={market.pair.speculativeToken}
                    text
                  />
                  <ChartIcons chart="down" token={market.pair.baseToken} text />
                </div>
              </div>
            </div>
          </div>
        )}
        {!amount.equalTo("0") && (
          <Balance>{amount.toSignificant(4, { groupSeparator: "," })}</Balance>
        )}
      </TokenOption>
    </Wrapper>
  );
};
