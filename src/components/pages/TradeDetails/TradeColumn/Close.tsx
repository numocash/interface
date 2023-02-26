import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { useMemo, useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import type { usePrepareContractWrite } from "wagmi";
import { useAccount } from "wagmi";

import { useEnvironment } from "../../../../contexts/environment2";
import { useSettings } from "../../../../contexts/settings";
import {
  useLendgineRouterBurn,
  usePrepareLendgineRouterBurn,
} from "../../../../generated";
import { useApprove } from "../../../../hooks/useApproval";
import { useBalance } from "../../../../hooks/useBalance";
import { useLendgine } from "../../../../hooks/useLendgine";
import type { BeetStage } from "../../../../utils/beet";
import { useBeet } from "../../../../utils/beet";
import {
  liquidityPerCollateral,
  liquidityPerShare,
} from "../../../../utils/Numoen/lendgineMath";
import {
  invert,
  numoenPrice,
  pricePerLiquidity,
  priceToFraction,
} from "../../../../utils/Numoen/price";
import { ONE_HUNDRED_PERCENT, scale } from "../../../../utils/Numoen/trade";
import tryParseCurrencyAmount from "../../../../utils/tryParseCurrencyAmount";
import { AssetSelection } from "../../../common/AssetSelection";
import { AsyncButton } from "../../../common/AsyncButton";
import { LoadingSpinner } from "../../../common/LoadingSpinner";
import { RowBetween } from "../../../common/RowBetween";
import { TokenAmountDisplay } from "../../../common/TokenAmountDisplay";
import { VerticalItem } from "../../../common/VerticalItem";
import { useTradeDetails } from "../TradeDetailsInner";

interface Props {
  modal: boolean;
}

export const Close: React.FC<Props> = ({ modal }: Props) => {
  const { setClose, quote, selectedLendgine } = useTradeDetails();

  const environment = useEnvironment();
  const settings = useSettings();
  const Beet = useBeet();
  const { address } = useAccount();
  const isInverse = selectedLendgine.token1.equals(quote);
  const symbol = quote.symbol + (isInverse ? "+" : "-");

  const lendgineInfoQuery = useLendgine(selectedLendgine);
  const balanceQuery = useBalance(selectedLendgine.lendgine, address);

  const [input, setInput] = useState("");

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(input, selectedLendgine.token1),
    [input, selectedLendgine.token1]
  );

  // TODO: account for unaccrued interest
  const {
    value: positionValue,
    shares,
    amount0,
    amount1,
  } = useMemo(() => {
    if (
      !lendgineInfoQuery.data ||
      lendgineInfoQuery.isLoading ||
      !balanceQuery.data ||
      balanceQuery.isLoading
    )
      return {};

    // token0 / token1
    const price = numoenPrice(selectedLendgine, lendgineInfoQuery.data);

    const liquidityPrice = pricePerLiquidity({
      lendgine: selectedLendgine,
      price,
    });

    // liq / share
    const liqPerShare = liquidityPerShare(
      selectedLendgine,
      lendgineInfoQuery.data
    );

    // liq / token1
    const liqPerCol = liquidityPerCollateral(selectedLendgine);

    const liquidity = liqPerShare.quote(balanceQuery.data);

    // token0
    const liquidityDebt = liquidityPrice.quote(liquidity);

    // token0
    const collateralValue = price.quote(liqPerCol.invert().quote(liquidity));

    // token1
    const value = invert(price).quote(collateralValue.subtract(liquidityDebt));

    if (!parsedAmount) return { value };

    const sharesFraction = parsedAmount
      .multiply(balanceQuery.data)
      .divide(value);

    const shares = CurrencyAmount.fromFractionalAmount(
      selectedLendgine.lendgine,
      sharesFraction.quotient,
      1
    );

    const liquidityMinted = liqPerShare.quote(shares);

    const amount0 = liquidityMinted
      .multiply(lendgineInfoQuery.data.reserve0)
      .divide(lendgineInfoQuery.data.totalLiquidity);

    const amount1 = liquidityMinted
      .multiply(lendgineInfoQuery.data.reserve1)
      .divide(lendgineInfoQuery.data.totalLiquidity);

    return { value, shares, amount0, amount1 };
  }, [
    balanceQuery.data,
    balanceQuery.isLoading,
    lendgineInfoQuery.data,
    lendgineInfoQuery.isLoading,
    parsedAmount,
    selectedLendgine,
  ]);

  // TODO: approving slightly too little
  const approve = useApprove(shares, environment.base.lendgineRouter);

  const args = useMemo(
    () =>
      !!shares && !!parsedAmount && !!address && !!amount0 && !!amount1
        ? ([
            {
              token0: getAddress(selectedLendgine.token0.address),
              token1: getAddress(selectedLendgine.token1.address),
              token0Exp: BigNumber.from(selectedLendgine.token0.decimals),
              token1Exp: BigNumber.from(selectedLendgine.token1.decimals),
              upperBound: BigNumber.from(
                priceToFraction(selectedLendgine.bound)
                  .multiply(scale)
                  .quotient.toString()
              ),
              shares: BigNumber.from(shares.quotient.toString()),
              collateralMin: BigNumber.from(
                parsedAmount
                  .multiply(
                    ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent)
                  )
                  .quotient.toString()
              ),
              amount0Min: BigNumber.from(
                amount0
                  .multiply(
                    ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent)
                  )
                  .quotient.toString()
              ),
              amount1Min: BigNumber.from(
                amount1
                  .multiply(
                    ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent)
                  )
                  .quotient.toString()
              ),
              swapType: 0,
              swapExtraData: AddressZero,
              recipient: address,
              deadline: BigNumber.from(
                Math.round(Date.now() / 1000) + settings.timeout * 60
              ),
            },
          ] as const)
        : undefined,
    [
      address,
      amount0,
      amount1,
      parsedAmount,
      selectedLendgine.bound,
      selectedLendgine.token0.address,
      selectedLendgine.token0.decimals,
      selectedLendgine.token1.address,
      selectedLendgine.token1.decimals,
      settings.maxSlippagePercent,
      settings.timeout,
      shares,
    ]
  );

  const prepareBurn = usePrepareLendgineRouterBurn({
    enabled: !!args && !!address,
    address: environment.base.lendgineRouter,
    args: args,
  });

  const sendBurn = useLendgineRouterBurn(prepareBurn.config);

  const disableReason = useMemo(
    () =>
      input === ""
        ? "Enter an amount"
        : // : parsedAmount && parsedAmount.equalTo(0)
        // ? "Enter more than zero"
        !parsedAmount
        ? "Invalid input"
        : !shares ||
          !balanceQuery.data ||
          balanceQuery.isLoading ||
          !approve.allowanceQuery.data ||
          !args
        ? "Loading"
        : shares.greaterThan(balanceQuery.data)
        ? "Insufficient balance"
        : null,
    [
      approve.allowanceQuery.data,
      args,
      balanceQuery.data,
      balanceQuery.isLoading,
      input,
      parsedAmount,
      shares,
    ]
  );

  return (
    <div tw="flex flex-col gap-4 w-full">
      {!modal && (
        <button onClick={() => setClose(false)} tw="items-center flex">
          <div tw="text-xs flex gap-1 items-center">
            <FaChevronLeft />
            Back
          </div>
        </button>
      )}
      <RowBetween tw="items-center p-0 ">
        <div tw="rounded-lg bg-secondary px-2 py-1 text-lg font-semibold">
          {symbol}
        </div>
        {positionValue ? (
          <VerticalItem
            label="Position value"
            item={
              <TokenAmountDisplay amount={positionValue} showSymbol tw="" />
            }
            tw="items-center"
          />
        ) : (
          <LoadingSpinner />
        )}
      </RowBetween>
      <AssetSelection
        tw="border-2 border-[#2b2c34] rounded-lg "
        inputValue={input}
        selectedValue={selectedLendgine.token1}
        label={<span>Receive</span>}
        inputOnChange={(value) => setInput(value)}
      />
      <AsyncButton
        variant="primary"
        tw="h-12 text-xl font-bold items-center"
        disabled={!!disableReason}
        onClick={async () => {
          await Beet(
            [
              approve.beetStage,
              {
                stageTitle: `Sell ${selectedLendgine.token1.symbol}+`,
                parallelTransactions: [
                  {
                    title: `Sell ${selectedLendgine.token1.symbol}+`,
                    tx: {
                      prepare: prepareBurn as ReturnType<
                        typeof usePrepareContractWrite
                      >,
                      send: sendBurn,
                    },
                  },
                ],
              },
            ].filter((s) => !!s) as BeetStage[]
          );

          setInput("");
        }}
      >
        {disableReason ?? <p>Sell {symbol}</p>}
      </AsyncButton>
    </div>
  );
};
