import invariant from "tiny-invariant";

import { useEnvironment } from "../../../../contexts/environment";
import { usePair } from "../../../../hooks/usePair";
import { ShareMetric } from "../../../common/ShareMetric";
import { TokenIcon } from "../../../common/TokenIcon";
import { useCreatePair } from ".";

export const Stats: React.FC = () => {
  const { speculativeToken, baseToken } = useCreatePair();
  const { markets } = useEnvironment();
  const market = markets[0];
  invariant(market);

  const pairInfo = usePair(market.pair);

  const apr = (
    <ShareMetric
      title="APR"
      value={
        <div tw="grid gap-4">
          <div tw="text-xl text-black">80%</div>
        </div>
      }
    />
  );

  return (
    <div tw="grid gap-8 md:gap-4 md:grid-cols-3 pb-9 px-6 pt-3">
      {apr}
      <ShareMetric
        title="Total Supply"
        value={
          <div tw="flex items-center">
            <div tw="flex-col flex gap-1">
              {[speculativeToken, baseToken].map((c, i) => (
                <div tw="flex flex-row items-center gap-1 text-black" key={i}>
                  <TokenIcon token={c} />
                  {pairInfo?.speculativeAmount.toFixed(2, {
                    groupSeparator: ",",
                  }) ?? "--"}
                  <div>{c?.symbol}</div>
                </div>
              ))}
            </div>
          </div>
        }
      />
      <ShareMetric
        title="Upper Bound"
        value={<div tw="h-7 flex items-center text-black">2.5 cUSD / CELO</div>}
      />
    </div>
  );
};
