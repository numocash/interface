import { Module } from "../../../common/Module";
import { TokenIcon } from "../../../common/TokenIcon";
import { useCreatePair } from ".";

export const PoolMeta: React.FC = () => {
  const {
    market: {
      pair: { baseToken, speculativeToken },
    },
  } = useCreatePair();
  return (
    <Module tw="flex flex-col max-w-2xl">
      <div tw="w-full justify-between flex">
        <p tw="text-secondary">Position Returns</p>
        <p tw="text-default font-semibold">80% APR</p>
      </div>
      <div tw="w-full justify-between flex">
        <p tw="text-secondary">Total CELO</p>
        <div tw="flex gap-2 items-center">
          <TokenIcon size={20} token={speculativeToken} />

          <p tw="text-default font-semibold">
            1000 {speculativeToken?.symbol ?? "--"}
          </p>
        </div>
      </div>
      <div tw="w-full justify-between flex">
        <p tw="text-secondary">Total cUSD</p>
        <div tw="flex gap-2 items-center">
          <TokenIcon size={20} token={baseToken} />

          <p tw="text-default font-semibold">
            1000 {baseToken?.symbol ?? "--"}
          </p>
        </div>
      </div>
    </Module>
  );
};
