import { useState } from "react";
import tw, { styled } from "twin.macro";
import type { Address } from "wagmi";

import { useUserTrades } from "../../../../../hooks/useUserTrades";
import { isLongLendgine } from "../../../../../lib/lendgines";
import { invert } from "../../../../../lib/price";
import { formatPrice } from "../../../../../utils/format";
import { TokenAmountDisplay } from "../../../../common/TokenAmountDisplay";
import { Divider } from "../../../Trade/Loading";
import { useTradeDetails } from "../../TradeDetailsInner";

interface Props {
  user: Address;
}

export const PersonalHistoryItems: React.FC<Props> = ({ user }: Props) => {
  const { lendgines } = useTradeDetails();
  const userTradesQuery = useUserTrades({ address: user, lendgines });

  const [page, setPage] = useState(1);

  return (
    <>
      {userTradesQuery.isLoading && <Loading />}
      {userTradesQuery.data && userTradesQuery.data.length === 0 ? (
        <div tw="w-full rounded-lg bg-gray-100  text-gray-500 justify-center py-2 flex font-semibold">
          No previous trades
        </div>
      ) : (
        userTradesQuery.data && (
          <div tw="flex flex-col gap-1">
            {userTradesQuery.data.map((trade, i) => (
              <>
                <Item trade={trade} key={trade.block} />
                {i !== (userTradesQuery.data?.length ?? 0) - 1 && (
                  <Divider tw="mx-0" key={trade.block} />
                )}
              </>
            ))}
            <div tw="grid w-full justify-self-center mt-4">
              <div tw="items-center w-full flex justify-center gap-2">
                <p>
                  Page {page} of {Math.ceil(userTradesQuery.data.length / 4)}
                </p>
              </div>
            </div>
          </div>
        )
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
    <div tw="w-full grid rounded-lg h-12 items-center grid-cols-3">
      <p tw="justify-self-start font-semibold">
        {trade.trade} {quote.symbol}
        {long ? "+" : "-"}
      </p>
      <TokenAmountDisplay
        amount={!long ? trade.value : trade.price.quote(trade.value)}
        showSymbol
        tw=" justify-self-start"
      />

      <p tw="justify-self-start">
        {long ? formatPrice(trade.price) : formatPrice(invert(trade.price))}
      </p>
    </div>
  );
};

const Loading = styled.div(() => [
  tw`flex w-full h-12 mt-2 duration-300 ease-in-out transform bg-gray-100 rounded-lg animate-pulse`,
]);
