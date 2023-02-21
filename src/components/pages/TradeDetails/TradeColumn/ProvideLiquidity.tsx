import { NavLink } from "react-router-dom";

import { useTradeDetails } from "../TradeDetailsInner";

export const ProvideLiquidity: React.FC = () => {
  const { base, quote } = useTradeDetails();
  return (
    <p tw="text-xs">
      Want to earn on your assets?{" "}
      <span tw="underline">
        <NavLink to={`/earn/details/${base.address}/${quote.address}`}>
          Provide liquidity
        </NavLink>
      </span>
    </p>
  );
};
