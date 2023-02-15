import { NavLink } from "react-router-dom";

import { useEarnDetails } from "..";

export const Trade: React.FC = () => {
  const { base, quote } = useEarnDetails();
  return (
    <p tw="text-xs">
      Want to trade power tokens?{" "}
      <span tw="underline">
        <NavLink to={`/trade/details/${base.address}/${quote.address}`}>
          Trade
        </NavLink>
      </span>
    </p>
  );
};
