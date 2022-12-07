import { FaChevronLeft } from "react-icons/fa";
import { NavLink, useParams } from "react-router-dom";
import invariant from "tiny-invariant";

import { useAddressToMarket } from "../../../../contexts/environment";
import { Arbitrage } from "./Arb";
import { ArbStateProvider } from "./useArbState";

export const Swap: React.FC = () => {
  const { lendgineAddress } = useParams<{
    lendgineAddress: string;
  }>();
  invariant(lendgineAddress, "pool address missing");

  const market = useAddressToMarket(lendgineAddress);
  invariant(market);
  return (
    <div tw="flex flex-col gap-4">
      <NavLink to={`/arb`} tw="flex items-center gap-2 text-default">
        <FaChevronLeft />
        <span tw="text-sm">Back to market list</span>
      </NavLink>
      <ArbStateProvider initialState={{ market }}>
        <Arbitrage />
      </ArbStateProvider>
    </div>
  );
};
