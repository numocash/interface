import { RowBetween } from "../../common/RowBetween";

export const TradeStats: React.FC = () => {
  return (
    <div tw="flex flex-col w-full">
      <RowBetween tw="p-0">
        <p>Bound</p>
        <p>--</p>
      </RowBetween>
      <RowBetween tw="p-0">
        <p>Funding rate</p>
        <p>--</p>
      </RowBetween>
      <RowBetween tw="p-0">
        <p>Leverage</p>
        <p>x²</p>
      </RowBetween>
      <RowBetween tw="p-0">
        <p>Liquidation price</p>
        <p>0 USDC / ETH</p>
      </RowBetween>
      <RowBetween tw="p-0">
        <p>Fees</p>
        <p>0</p>
      </RowBetween>
    </div>
  );
};
