import { RowBetween } from "../../../common/RowBetween";

export const Stats: React.FC = () => {
  return (
    <>
      <RowBetween tw="pt-6">
        <p tw="text-default">APR</p>
        <p tw="text-default">10.2%</p>
      </RowBetween>
      <div tw="border-container border"></div>
      <RowBetween>
        <p tw="text-default">TVL</p>
        <p tw="text-default">2,000.00 cUSD</p>
      </RowBetween>
    </>
  );
};
