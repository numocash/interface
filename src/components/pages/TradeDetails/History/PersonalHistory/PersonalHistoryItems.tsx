import tw, { styled } from "twin.macro";
import type { Address } from "wagmi";

import { useUserTrades } from "../../../../../hooks/useUserTrades";
import { isLongLendgine } from "../../../../../lib/lendgines";
import { invert } from "../../../../../lib/price";
import { formatPrice } from "../../../../../utils/format";
import { TokenAmountDisplay } from "../../../../common/TokenAmountDisplay";
import { useTradeDetails } from "../../TradeDetailsInner";

interface Props {
  user: Address;
}

export const PersonalHistoryItems: React.FC<Props> = ({ user }: Props) => {
  const { lendgines } = useTradeDetails();
  const userTradesQuery = useUserTrades({ address: user, lendgines });

  return (
    <>
      {userTradesQuery.isLoading && <Loading />}
      {userTradesQuery.data && (
        <div tw="flex flex-col gap-1">
          {userTradesQuery.data.map((trade) => (
            <Item trade={trade} key={trade.block} />
          ))}
        </div>
      )}
    </>
  );
};

type ItemProps = {
  trade: NonNullable<ReturnType<typeof useUserTrades>["data"]>[number];
};

const Item: React.FC<ItemProps> = ({ trade }: ItemProps) => {
  const { base, quote } = useTradeDetails();
  const long = isLongLendgine(trade.lendgine, base);
  return (
    <div tw="w-full justify-between rounded-lg font-semibold h-12 items-center grid-cols-5 hidden md:grid">
      <p tw="col-span-2 justify-self-start">
        {trade.trade} {quote.symbol}
        {long ? "+" : "-"}
      </p>
      <TokenAmountDisplay
        amount={!long ? trade.value : trade.price.quote(trade.value)}
        showSymbol
        tw="col-start-3 col-span-2 justify-self-start"
      />

      <p tw="col-start-5 col-span-1 justify-self-start">
        {long ? formatPrice(trade.price) : formatPrice(invert(trade.price))}
      </p>
    </div>
  );
};

const Loading = styled.div(() => [
  tw`w-full h-12 duration-300 ease-in-out transform rounded-lg bg-secondary animate-pulse`,
]);
