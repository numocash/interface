import type { WrappedTokenInfo } from "../../../hooks/useTokens2";
import { RowBetween } from "../../common/RowBetween";
import { TokenIcon } from "../../common/TokenIcon";

interface Props {
  tokens: readonly [WrappedTokenInfo, WrappedTokenInfo];
}

export const MarketItem: React.FC<Props> = ({ tokens }: Props) => {
  return (
    <Wrapper hasDeposit={false}>
      <div tw="py-2 px-4 gap-4 flex flex-col bg-white rounded-t-xl">
        <div tw="flex items-center gap-3 col-span-2">
          <div tw="flex items-center space-x-[-0.5rem] rounded-lg bg-gray-200 px-2 py-1">
            <TokenIcon token={tokens[1]} size={32} />
            <TokenIcon token={tokens[0]} size={32} />
          </div>
          <div tw="grid gap-0.5">
            <span tw="font-semibold text-lg text-default leading-tight">
              {tokens[1].symbol} / {tokens[0].symbol}
            </span>
          </div>
        </div>

        <div tw="flex flex-col ">
          <p tw="text-sm text-secondary">Best APR</p>
          <p tw="text-default font-bold">21.4%%</p>
        </div>

        <div tw="flex flex-col">
          <p tw="text-sm text-secondary">TVL</p>
          <p tw="text-default font-bold">1000 {tokens[0].symbol}</p>
        </div>
      </div>
      <div tw="bg-gray-200 w-full overflow-hidden">
        <RowBetween tw="items-center bg-transparent">
          <p>Your position</p>
          <p>--</p>
        </RowBetween>
      </div>
    </Wrapper>
  );
};

interface WrapperProps {
  hasDeposit: boolean;

  children?: React.ReactNode;
}

const Wrapper: React.FC<WrapperProps> = ({
  hasDeposit,
  children,
}: WrapperProps) => {
  return hasDeposit ? (
    <div tw="border-t-2 border-black rounded-xl transform ease-in-out hover:scale-110 duration-300">
      <div tw="rounded-xl w-full border-2 bg-gray-200 border-t-0">
        {children}
      </div>
    </div>
  ) : (
    <div tw="rounded-xl w-full border-2  transform ease-in-out hover:scale-110 duration-300 bg-gray-200">
      {children}
    </div>
  );
};
