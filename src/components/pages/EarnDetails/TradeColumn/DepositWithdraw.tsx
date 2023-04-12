import { Deposit } from "./Deposit";
import { Withdraw } from "./Withdraw";
import { useEarnDetails } from "../EarnDetailsInner";

export const DepositWithdraw: React.FC = () => {
  const { close } = useEarnDetails();
  return close ? <Withdraw /> : <Deposit />;
};
