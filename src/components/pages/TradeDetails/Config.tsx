import { useMostLiquidMarket } from "../../../hooks/useUniswapPair";
import { AddressLink } from "../../../utils/beet";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { RowBetween } from "../../common/RowBetween";
import { useTradeDetails } from ".";

export const Config: React.FC = () => {
  const { denom, other } = useTradeDetails();
  const referenceMarketQuery = useMostLiquidMarket({ denom, other });

  return (
    <div tw="flex flex-col w-full">
      <RowBetween tw="items-center">
        <p tw="text-sm">Reference market:</p>

        {referenceMarketQuery.data ? (
          <AddressLink
            address={referenceMarketQuery.data.address}
            tw=" underline"
          />
        ) : (
          <LoadingSpinner />
        )}
      </RowBetween>
    </div>
  );
};
