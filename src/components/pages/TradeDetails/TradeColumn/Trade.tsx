import { Buy } from "./Buy";
import { Close } from "./Close";
import { useTradeDetails } from "../TradeDetailsInner";

export const Trade: React.FC = () => {
  const { close } = useTradeDetails();

  return close ? <Close modal={false} /> : <Buy />;
};
