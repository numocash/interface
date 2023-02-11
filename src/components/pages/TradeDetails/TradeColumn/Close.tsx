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
  convertLiquidityToCollateral,
  convertPriceToLiquidityPrice,
  convertShareToLiquidity,
} from "../../../../utils/Numoen/lendgineMath";
import { numoenPrice } from "../../../../utils/Numoen/price";
import { scale } from "../../../../utils/Numoen/trade";
import tryParseCurrencyAmount from "../../../../utils/tryParseCurrencyAmount";
import { AssetSelection } from "../../../common/AssetSelection";
import { AsyncButton } from "../../../common/AsyncButton";
import { LoadingSpinner } from "../../../common/LoadingSpinner";
import { RowBetween } from "../../../common/RowBetween";
import { VerticalItem } from "../../../common/VerticalItem";
import { useTradeDetails } from "..";

export const Close: React.FC = () => {
  const { setClose, quote, selectedLendgine } = useTradeDetails();
  const environment = useEnvironment();
  const settings = useSettings();
  const Beet = useBeet();
  const { address } = useAccount();
  const symbol =
    quote.symbol + (selectedLendgine.token1.equals(quote) ? "+" : "-");

  const lendgineInfoQuery = useLendgine(selectedLendgine);
  const balanceQuery = useBalance(selectedLendgine.lendgine, address);

  const [input, setInput] = useState("");

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(input, selectedLendgine.token1),
    [input, selectedLendgine.token1]
  );

  // TODO: account for unaccrued interest
  const { value: positionValue, shares } = useMemo(() => {
    if (
      !lendgineInfoQuery.data ||
      lendgineInfoQuery.isLoading ||
      !balanceQuery.data ||
      balanceQuery.isLoading
    )
      return {};

    const price = numoenPrice(selectedLendgine, lendgineInfoQuery.data);
    const liquidityPrice = convertPriceToLiquidityPrice(
      price,
      selectedLendgine
    );

    const liquidity = convertShareToLiquidity(
      balanceQuery.data,
      lendgineInfoQuery.data
    );
    const collateral = convertLiquidityToCollateral(
      liquidity,
      selectedLendgine
    );

    const liquidityValue = liquidity.multiply(liquidityPrice).divide(price);
    const collateralValue = collateral;

    const value = collateralValue.subtract(liquidityValue).divide(scale);
    if (!parsedAmount) return { value };

    const sharesFraction = parsedAmount
      .multiply(balanceQuery.data)
      .divide(value)
      .divide(scale);

    const shares = CurrencyAmount.fromFractionalAmount(
      selectedLendgine.lendgine,
      sharesFraction.quotient,
      1
    );

    const liquidityMinted = convertShareToLiquidity(
      shares,
      lendgineInfoQuery.data
    );

    return { value, shares };
  }, [
    balanceQuery.data,
    balanceQuery.isLoading,
    lendgineInfoQuery.data,
    lendgineInfoQuery.isLoading,
    parsedAmount,
    selectedLendgine,
  ]);

  console.log(shares?.quotient.toString());

  // TODO: approving slightly too little
  const approve = useApprove(shares, environment.base.lendgineRouter);

  const args = useMemo(
    () =>
      !!shares && !!parsedAmount && !!address
        ? ([
            {
              token0: getAddress(selectedLendgine.token0.address),
              token1: getAddress(selectedLendgine.token1.address),
              token0Exp: BigNumber.from(selectedLendgine.token0.decimals),
              token1Exp: BigNumber.from(selectedLendgine.token1.decimals),
              upperBound: BigNumber.from(
                selectedLendgine.bound.asFraction
                  .multiply(scale)
                  .quotient.toString()
              ),
              shares: BigNumber.from(shares.quotient.toString()),
              // collateralMin: BigNumber.from(
              //   parsedAmount
              //     .multiply(
              //       ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent)
              //     )
              //     .quotient.toString()
              // ),
              collateralMin: BigNumber.from(0),
              amount0Min: BigNumber.from(0),
              amount1Min: BigNumber.from(0),
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
      parsedAmount,
      selectedLendgine.bound.asFraction,
      selectedLendgine.token0.address,
      selectedLendgine.token0.decimals,
      selectedLendgine.token1.address,
      selectedLendgine.token1.decimals,
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
        : !parsedAmount
        ? "Invalid input"
        : !shares ||
          !balanceQuery.data ||
          balanceQuery.isLoading ||
          !approve.allowanceQuery.data
        ? "Loading"
        : shares.greaterThan(balanceQuery.data)
        ? "Insufficient balance"
        : null,
    [
      approve.allowanceQuery.data,
      balanceQuery.data,
      balanceQuery.isLoading,
      input,
      parsedAmount,
      shares,
    ]
  );

  return (
    <div tw="flex flex-col gap-2 w-full">
      <button onClick={() => setClose(false)} tw="items-center flex">
        <div tw="text-xs flex gap-1 items-center">
          <FaChevronLeft />
          Back
        </div>
      </button>
      <RowBetween tw="items-center p-0">
        <div tw="rounded-lg bg-gray-200 px-2 py-1 text-lg font-semibold">
          {symbol}
        </div>
        {positionValue ? (
          <VerticalItem
            label="Position value"
            item={
              <div tw="mb-[-6px]">
                {positionValue.toSignificant(5)}
                <span tw="text-sm "> {selectedLendgine.token1.symbol}</span>
              </div>
            }
            tw="items-center"
          />
        ) : (
          <LoadingSpinner />
        )}
      </RowBetween>
      <AssetSelection
        tw="border-2 border-gray-200 rounded-lg "
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
