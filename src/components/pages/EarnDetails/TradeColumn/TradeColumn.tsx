import { useEarnDetails } from "../EarnDetailsInner";
import { Config } from "./Config";
import { DepositWithdraw } from "./DepositWithdraw";
import { Trade } from "./Trade";

export const TradeColumn: React.FC = () => {
  const { close } = useEarnDetails();
  return (
    <div tw="pl-8 lg:pl-10 transform ease-in-out duration-300 flex-col gap-4 w-full hidden xl:flex">
      <p tw="text-xl font-bold">{!close && "Deposit"}</p>
      <DepositWithdraw />
      <Trade />
      <div tw="w-full border-b-2 border-stroke" />
      <Config />
    </div>
  );
};
