import { NavLink } from "react-router-dom";

import { useEarnDetails } from "../EarnDetailsInner";

export const Trade: React.FC = () => {
  const { base, quote } = useEarnDetails();
  return (
    <div tw="flex justify-center">
      <p tw="text-xs text-secondary">
        Want to trade power tokens?{" "}
        <span tw="underline">
          <NavLink to={`/trade/details/${base.address}/${quote.address}`}>
            Trade
          </NavLink>
        </span>
      </p>
    </div>
  );
};
