import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { useBalances } from "../../../hooks/useBalance";
import { Button } from "../../common/Button";
import { useTradeDetails } from ".";
import { EmptyPosition } from "./EmptyPosition";

export const Positions: React.FC = () => {
  const { lendgines, other } = useTradeDetails();
  const { address } = useAccount();
  const balances = useBalances(
    lendgines.map((l) => l.lendgine),
    address
  );
  return balances.isLoading ? (
    <div tw="w-full rounded-lg bg-gray-200 justify-center py-2 flex font-semibold h-12" />
  ) : balances.data?.length === 0 ? (
    <EmptyPosition />
  ) : (
    <>
      {balances.data?.map((d) => {
        if (d.equalTo(0)) return null;
        const lendgine = lendgines.find(
          (l) => l.address === d.currency.address
        );
        invariant(lendgine);
        const symbol =
          other.symbol + (lendgine.token1.equals(other) ? "+" : "-");
        return (
          <div
            tw="w-full justify-between bg-gray-200  rounded-lg px-4 py-2 flex font-semibold h-12 items-center"
            key={d.currency.address}
          >
            {symbol}

            <Button variant="primary" tw="bg-red">
              Close
            </Button>
          </div>
        );
      })}
    </>
  );
};
