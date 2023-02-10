import type { Percent, Price } from "@uniswap/sdk-core";

import type { WrappedTokenInfo } from "../../../../hooks/useTokens2";
import { LoadingSpinner } from "../../../common/LoadingSpinner";
import { RowBetween } from "../../../common/RowBetween";

interface Props {
  bound: Price<WrappedTokenInfo, WrappedTokenInfo>;
  borrowRate: Percent | null;
  isInverse: boolean;
}

export const BuyStats: React.FC<Props> = ({
  bound,
  borrowRate,
  isInverse,
}: Props) => {
  return (
    <div tw="flex flex-col w-full">
      <RowBetween tw="p-0">
        <p>Bound</p>
        <p>
          {(isInverse ? bound.invert() : bound).asFraction.toSignificant(5, {
            groupSeparator: ",",
          })}
        </p>
      </RowBetween>
      <RowBetween tw="p-0">
        <p>Funding APR</p>
        <p>
          {borrowRate ? (
            borrowRate.toFixed(2, { groupSeparator: "," }) + "%"
          ) : (
            <LoadingSpinner />
          )}
        </p>
      </RowBetween>
      <RowBetween tw="p-0">
        <p>Leverage</p>
        <p>{isInverse ? "1/x" : "x²"}</p>
      </RowBetween>
      <RowBetween tw="p-0">
        <p>Liquidation price</p>
        <p>{isInverse ? "∞" : 0}</p>
      </RowBetween>
      <RowBetween tw="p-0">
        <p>Fees</p>
        <p>0</p>
      </RowBetween>
    </div>
  );
};
