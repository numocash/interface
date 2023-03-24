import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import tw, { styled } from "twin.macro";

import { useTrades } from "../../../../../hooks/useTrades";
import { isLongLendgine } from "../../../../../lib/lendgines";
import { invert } from "../../../../../lib/price";
import { AddressLink } from "../../../../../utils/beet";
import { formatPrice } from "../../../../../utils/format";
import { TokenAmountDisplay } from "../../../../common/TokenAmountDisplay";
import { Divider } from "../../../Trade/Loading";
import { useTradeDetails } from "../../TradeDetailsInner";

export const TotalHistoryItems: React.FC = () => {
  const { lendgines } = useTradeDetails();
  const tradesQuery = useTrades({ lendgines });

  const [page, setPage] = useState(1);

  const trades = tradesQuery.data?.slice(
    4 * (page - 1),
    4 * page > tradesQuery?.data.length ? undefined : 4 * page
  );

  return (
    <>
      {tradesQuery.isLoading && <Loading />}
      {tradesQuery.data && tradesQuery.data.length === 0 ? (
        <div tw="w-full rounded-lg bg-gray-100  text-gray-500 justify-center py-2 flex font-semibold">
          No previous trades
        </div>
      ) : (
        tradesQuery.data && (
          <div tw="flex flex-col gap-1 justify-between h-full">
            <div tw="flex flex-col gap-1">
              <div tw="w-full text-secondary items-center grid-cols-3 sm:grid-cols-4 grid">
                <p tw="col-start-2 justify-self-end text-xs sm:text-sm">
                  Value
                </p>
                <p tw="col-start-3 justify-self-end text-xs sm:text-sm">
                  Price
                </p>
                <p tw="col-start-4 justify-self-end hidden sm:flex">Account</p>
              </div>
              <div tw="border-b border-gray-200 w-full" />
              {trades?.map((trade, i) => (
                <>
                  <Item
                    trade={trade}
                    key={trade.block + trade.lendgine.address}
                  />
                  {i !== (trades?.length ?? 0) - 1 && (
                    <Divider tw="mx-0" key={trade.block} />
                  )}
                </>
              ))}
            </div>
            <div tw="flex w-full justify-self-end mt-4 ">
              <div tw="items-center w-full flex justify-center gap-2">
                <button onClick={() => setPage(page - 1)} disabled={page === 1}>
                  <IoIosArrowDown tw="rotate-90" />
                </button>
                <p>
                  Page {page} of {Math.ceil(tradesQuery.data.length / 4)}
                </p>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === Math.ceil(tradesQuery.data.length / 4)}
                >
                  <IoIosArrowDown tw="-rotate-90" />
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
};

type ItemProps = {
  trade: NonNullable<ReturnType<typeof useTrades>["data"]>[number];
};

const Item: React.FC<ItemProps> = ({ trade }: ItemProps) => {
  const { base, quote } = useTradeDetails();
  const long = isLongLendgine(trade.lendgine, base);
  return (
    <div tw="w-full grid rounded-lg h-12 items-center grid-cols-3 sm:grid-cols-4">
      <p tw="justify-self-start font-semibold text-sm sm:text-base">
        {trade.trade} {quote.symbol}
        {long ? "+" : "-"}
      </p>
      <TokenAmountDisplay
        amount={!long ? trade.value : trade.price.quote(trade.value)}
        showSymbol
        tw=" justify-self-end text-sm sm:text-base"
      />

      <p tw="justify-self-end text-sm sm:text-base">
        {long ? formatPrice(trade.price) : formatPrice(invert(trade.price))}
      </p>
      <AddressLink
        address={trade.account}
        data="address"
        tw="justify-self-end hidden sm:flex"
      />
    </div>
  );
};

const Loading = styled.div(() => [
  tw`flex w-full h-12 mt-2 duration-300 ease-in-out transform bg-gray-100 rounded-lg animate-pulse`,
]);
