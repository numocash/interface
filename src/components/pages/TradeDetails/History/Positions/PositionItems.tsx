import type { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { Percent } from "@uniswap/sdk-core";
import { utils } from "ethers";
import { useMemo } from "react";
import type { Address } from "wagmi";

import { useBalances } from "../../../../../hooks/useBalances";
import { useLendgines } from "../../../../../hooks/useLendgines";
import type { UserTrade } from "../../../../../hooks/useUserTrades";
import { useUserTrades } from "../../../../../hooks/useUserTrades";
import { borrowRate } from "../../../../../lib/jumprate";
import { accruedLendgineInfo, getT } from "../../../../../lib/lendgineMath";
import { numoenPrice } from "../../../../../lib/price";
import { calculateAmountBoughtAndSold } from "../../../../../lib/returns";
import type { Lendgine, LendgineInfo } from "../../../../../lib/types/lendgine";
import type { WrappedTokenInfo } from "../../../../../lib/types/wrappedTokenInfo";
import { formatPercent } from "../../../../../utils/format";
import { Button } from "../../../../common/Button";
import { TokenAmountDisplay } from "../../../../common/TokenAmountDisplay";
import { Divider } from "../../../Trade/Loading";
import { useTradeDetails } from "../../TradeDetailsInner";
import { usePositionValue } from "../../usePositionValue";
import { Loading } from "../PersonalHistory/PersonalHistoryItems";

interface Props {
  address: Address;
}

export const PositionItems: React.FC<Props> = ({ address }: Props) => {
  const { lendgines } = useTradeDetails();
  const balances = useBalances(
    lendgines?.map((l) => l.lendgine),
    address
  );
  const lendgineInfos = useLendgines(lendgines);
  const userTradesQuery = useUserTrades({ address, lendgines });

  return (
    <>
      {(userTradesQuery.isLoading ||
        balances.isLoading ||
        lendgineInfos.isLoading) && <Loading />}
      {balances.data &&
      balances.data.filter((b) => b.greaterThan(0)).length === 0 ? (
        <div tw="w-full rounded-lg bg-gray-100  text-gray-500 justify-center py-2 flex font-semibold">
          No positions
        </div>
      ) : (
        balances.data &&
        lendgineInfos.data &&
        userTradesQuery.data && (
          <div tw="flex flex-col gap-1">
            <div tw="w-full text-secondary items-center grid-cols-3 sm:grid-cols-5 grid">
              <p tw=" col-start-2 justify-self-end">Value</p>
              <p tw=" justify-self-end hidden sm:( grid)">Returns</p>

              <p tw="hidden sm:( grid) justify-self-end">Funding APR</p>
            </div>
            <div tw="border-b border-gray-200 w-full" />
            {balances.data
              .map((b, i) =>
                b.greaterThan(0)
                  ? {
                      balance: b,
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      lendgine: lendgines[i]!,
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      lendgineInfo: lendgineInfos.data![i]!,
                      userTrades: userTradesQuery.data.filter(
                        (t) =>
                          utils.getAddress(t.lendgine.address) ===
                          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                          utils.getAddress(lendgines[i]!.address)
                      ),
                    }
                  : undefined
              )
              .filter(
                (
                  t
                ): t is {
                  balance: CurrencyAmount<WrappedTokenInfo>;
                  lendgine: Lendgine;
                  lendgineInfo: LendgineInfo<Lendgine>;
                  userTrades: UserTrade[];
                } => !!t
              )
              ?.map((trade, i, arr) => (
                <>
                  <PositionItem
                    balance={trade.balance}
                    lendgine={trade.lendgine}
                    lendgineInfo={trade.lendgineInfo}
                    key={trade?.lendgine.address}
                    userTrades={trade.userTrades}
                  />
                  {i !== arr.length - 1 && (
                    <Divider tw="mx-0" key={trade.lendgine.address + "div"} />
                  )}
                </>
              ))}
          </div>
        )
      )}
    </>
  );
};

type ItemProps<L extends Lendgine = Lendgine> = {
  balance: CurrencyAmount<Token>;
  lendgine: L;
  lendgineInfo: LendgineInfo<L>;
  userTrades: NonNullable<ReturnType<typeof useUserTrades>["data"]>;
};

const PositionItem: React.FC<ItemProps> = ({
  lendgine,
  lendgineInfo,
  userTrades,
}: ItemProps) => {
  const { base, quote, setSelectedLendgine, setClose } = useTradeDetails();
  const symbol = quote.symbol + (lendgine.token1.equals(quote) ? "+" : "-");
  const isInverse = base.equals(lendgine.token1);

  const positionValue = usePositionValue(lendgine);
  const t = getT();

  const funding = useMemo(() => {
    const updatedLendgineInfo = accruedLendgineInfo(lendgine, lendgineInfo, t);
    return borrowRate(updatedLendgineInfo);
  }, [lendgine, lendgineInfo, t]);

  const value = useMemo(() => {
    if (!positionValue) return undefined;
    // token0 / token1
    const price = numoenPrice(lendgine, lendgineInfo);

    return isInverse ? positionValue : price.quote(positionValue);
  }, [isInverse, lendgine, lendgineInfo, positionValue]);

  const returns = useMemo(() => {
    if (!positionValue) return undefined;
    const { totalAmountBought, totalAmountSold } = calculateAmountBoughtAndSold(
      {
        lendgine,
        trades: userTrades,
      }
    );

    if (totalAmountBought.equalTo(0)) return new Percent(0);
    else {
      const returnFraction = totalAmountSold
        .add(positionValue)
        .subtract(totalAmountBought)
        .divide(totalAmountBought).asFraction;

      return new Percent(returnFraction.numerator, returnFraction.denominator);
    }
  }, [lendgine, positionValue, userTrades]);

  return (
    <div tw="w-full justify-between grid grid-cols-3 sm:grid-cols-5 items-center h-12">
      <p tw="font-semibold ">{symbol}</p>

      {value ? (
        <TokenAmountDisplay amount={value} showSymbol tw=" justify-self-end" />
      ) : (
        <div tw="w-14 sm:w-20 h-6 rounded-lg justify-self-end bg-gray-100 " />
      )}
      {returns ? (
        <p tw="justify-self-end hidden sm:( grid)">{formatPercent(returns)}</p>
      ) : (
        <div tw="w-10 sm:w-16 h-6 rounded-lg justify-self-end bg-gray-100 hidden sm:( grid)" />
      )}

      <p tw="justify-self-end  hidden sm:( grid)">{formatPercent(funding)}</p>

      <Button
        variant="danger"
        tw="w-fit px-2 justify-self-end text-lg font-semibold"
        onClick={() => {
          setClose(true);
          setSelectedLendgine(lendgine);
        }}
      >
        Close
      </Button>
    </div>
  );
};
