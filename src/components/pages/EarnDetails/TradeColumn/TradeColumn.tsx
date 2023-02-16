import { useEarnDetails } from "..";
import { Config } from "./Config";
import { DepositWithdraw } from "./DepositWithdraw";
import { Trade } from "./Trade";

export const TradeColumn: React.FC = () => {
  const { close } = useEarnDetails();
  return (
    <div tw="pl-6 lg:pl-8 xl:pl-12 transform ease-in-out duration-300 py-2 flex flex-col gap-4 w-full">
      <p tw="text-xl font-bold">{!close && "Deposit"}</p>
      <DepositWithdraw />
      <Trade />
      <div tw="w-full border-b-2 border-gray-200" />
      <Config />
    </div>
  );
};