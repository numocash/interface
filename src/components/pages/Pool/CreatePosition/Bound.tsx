import invariant from "tiny-invariant";

import { Module } from "../../../common/Module";
import { useCreatePair } from ".";

export const Bound: React.FC = () => {
  const { bound, speculativeToken, baseToken } = useCreatePair();
  invariant(bound && speculativeToken && baseToken);

  return (
    <Module tw="flex flex-col w-full py-3 max-w-2xl">
      <p tw="text-default">Bound</p>
      <p tw="text-default font-semibold text-xl">
        {bound.toFixed(2)}{" "}
        <span tw="font-medium text-sm">
          {bound.baseCurrency.symbol} / {bound.quoteCurrency.symbol}
        </span>
      </p>
    </Module>
  );
};
