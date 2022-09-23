import { Module } from "../../../common/Module";
import { Payoff } from "../../../common/Payoff";
import { useCreatePair } from ".";
import { Bound } from "./Bound";
import { PoolMeta } from "./PoolMeta";

export const Review: React.FC = () => {
  const { baseToken, bound } = useCreatePair();
  return (
    <Module tw="flex max-w-xl w-full flex-col gap-4">
      <p tw="font-bold text-default text-xl">2. Review Position</p>
      <p tw=" text-default text-sm ">
        {`Our custom invariant requires an upper bound at which the position will
        be entirely held in ${baseToken ? baseToken.symbol : "base tokens"}`}
      </p>
      <Bound />
      <PoolMeta />
      <Payoff bound={bound} />
    </Module>
  );
};
