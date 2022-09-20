import type { Token, TokenAmount } from "@dahlia-labs/token-utils";
import type { CSSProperties } from "react";
import React from "react";
import tw, { styled } from "twin.macro";

import { TokenInfo } from "../../../common/TokenInfo";

const Balance = styled.div(() => [
  tw`text-base text-secondary dark:text-secondary-d`,
]);

const TokenOption = styled.div(() => [
  tw`flex items-center justify-between w-full`,
  tw`cursor-pointer`,
]);

const Wrapper = styled.div<{ disabled?: boolean }>(({ disabled }) => [
  tw`px-4 flex hover:(bg-action) hover:dark:bg-action-d`,
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
  return (
    <Wrapper style={style} onClick={onClick} disabled={isSelected || !onClick}>
      <TokenOption>
        <TokenInfo iconSize={24} small token={token} />
        {!amount.equalTo("0") && (
          <Balance>{amount.toSignificant(4, { groupSeparator: "," })}</Balance>
        )}
      </TokenOption>
    </Wrapper>
  );
};
