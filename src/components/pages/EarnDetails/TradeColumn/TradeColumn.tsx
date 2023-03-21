import { useEarnDetails } from "../EarnDetailsInner";
import { DepositWithdraw } from "./DepositWithdraw";
import { Trade } from "./Trade";

export const TradeColumn: React.FC = () => {
  const { close } = useEarnDetails();
  return (
    <div tw="w-full flex flex-col gap-4 bg-white border rounded-xl border-gray-200 p-6 pb-2 shadow">
      <p tw="text-xl font-bold">{!close && "Deposit"}</p>
      <DepositWithdraw />
      <Trade />
    </div>
  );
};
