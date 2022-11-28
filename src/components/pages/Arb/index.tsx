import { useParams } from "react-router-dom";
import invariant from "tiny-invariant";

import { useAddressToMarket } from "../../../contexts/environment";
import { Arbitrage } from "./Arb";
import { ArbStateProvider } from "./useArbState";

export const Arb: React.FC = () => {
  const { lendgineAddress } = useParams<{
    lendgineAddress: string;
  }>();
  invariant(lendgineAddress, "pool address missing");

  const market = useAddressToMarket(lendgineAddress);
  invariant(market);
  return (
    <div tw="flex flex-col gap-4">
      <ArbStateProvider initialState={{ market }}>
        <Arbitrage />
      </ArbStateProvider>
    </div>
  );
};
