import { Module } from "../../../common/Module";
import { Payoff } from "../../../common/Payoff";
import { useAddPosition } from ".";

export const Review: React.FC = () => {
  const { market } = useAddPosition();
  return market ? (
    <Module tw="flex max-w-xl w-full flex-col gap-4">
      <p tw="font-bold text-default text-xl">2. Review Position</p>
      <p tw=" text-default text-sm ">
        {`Our custom invariant requires an upper bound at which the position will
        be entirely held in ${market.pair.baseToken.symbol}`}
      </p>

      <Payoff bound={market.pair.bound} />
    </Module>
  ) : null;
};
