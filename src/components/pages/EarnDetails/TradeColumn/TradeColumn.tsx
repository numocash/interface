import { useEarnDetails } from "../EarnDetailsInner";
import { Config } from "./Config";
import { DepositWithdraw } from "./DepositWithdraw";
import { Trade } from "./Trade";

export const TradeColumn: React.FC = () => {
  const { close } = useEarnDetails();
  return (
    <div tw="pl-6 lg:pl-8 xl:pl-12 transform ease-in-out duration-300 py-2 flex-col gap-4 w-full hidden xl:flex">
      <p tw="text-xl font-bold">{!close && "Deposit"}</p>
      <DepositWithdraw />
      <Trade />
      <div tw="w-full border-b-2 border-stroke" />
      <Config />
    </div>
  );
};
