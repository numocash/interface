import { Module } from "../../../common/Module";

export const PoolMeta: React.FC = () => {
  return (
    <Module tw="flex flex-col">
      <div tw="w-full justify-between flex">
        <p tw="text-secondary">Position Returns</p>
        <p tw="text-default">80% APR</p>
      </div>
      <div tw="w-full justify-between flex">
        <p tw="text-secondary">Total CELO</p>
        <p tw="text-default">1000 CELO</p>
      </div>
      <div tw="w-full justify-between flex">
        <p tw="text-secondary">Total cUSD</p>
        <p tw="text-default">1000 cUSD</p>
      </div>
    </Module>
  );
};
