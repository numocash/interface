import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { useMemo, useState } from "react";
import type { usePrepareContractWrite } from "wagmi";
import { useAccount } from "wagmi";

import { useEnvironment } from "../../../../contexts/environment2";
import { useSettings } from "../../../../contexts/settings";
import {
  useLendgineRouterMint,
  usePrepareLendgineRouterMint,
} from "../../../../generated";
import { useApprove } from "../../../../hooks/useApproval";
import { useBalance } from "../../../../hooks/useBalance";
import { useLendgine } from "../../../../hooks/useLendgine";
import type { BeetStage } from "../../../../utils/beet";
import { useBeet } from "../../../../utils/beet";
import { isLongLendgine } from "../../../../utils/lendgines";
import { borrowRate } from "../../../../utils/Numoen/jumprate";
import {
  liquidityPerCollateral,
  liquidityPerShare,
} from "../../../../utils/Numoen/lendgineMath";
import { numoenPrice, priceToFraction } from "../../../../utils/Numoen/price";
import {
  determineBorrowAmount,
  ONE_HUNDRED_PERCENT,
  scale,
} from "../../../../utils/Numoen/trade";
import tryParseCurrencyAmount from "../../../../utils/tryParseCurrencyAmount";
import { AssetSelection } from "../../../common/AssetSelection";
import { AsyncButton } from "../../../common/AsyncButton";
import { useTradeDetails } from "../TradeDetailsInner";
import { BuyStats } from "./BuyStats";

export const Buy: React.FC = () => {
  const {
    quote,
    base,
    selectedLendgine,
    price: referencePrice,
  } = useTradeDetails();
  const isLong = isLongLendgine(selectedLendgine, base);
  const Beet = useBeet();
  const { address } = useAccount();
  const environment = useEnvironment();
  const settings = useSettings();

  const selectedLendgineInfo = useLendgine(selectedLendgine);

  const [input, setInput] = useState("");
  const balance = useBalance(selectedLendgine.token1, address);

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(input, selectedLendgine.token1),
    [input, selectedLendgine.token1]
  );
  const approve = useApprove(parsedAmount, environment.base.lendgineRouter);
  // TODO: short funding rate is wrong
  const { borrowAmount, liquidity, shares, bRate } = useMemo(() => {
    if (selectedLendgineInfo.data?.totalLiquidity.equalTo(0)) return {};
    if (!selectedLendgineInfo.data || !parsedAmount) return {};

    const price = numoenPrice(selectedLendgine, selectedLendgineInfo.data);
    const liqPerShare = liquidityPerShare(
      selectedLendgine,
      selectedLendgineInfo.data
    );
    const liqPerCol = liquidityPerCollateral(selectedLendgine);

    const borrowAmount = determineBorrowAmount(
      parsedAmount,
      selectedLendgine,
      selectedLendgineInfo.data,
      referencePrice,
      settings.maxSlippagePercent
    );

    const liquidity = liqPerCol.quote(borrowAmount.add(parsedAmount));

    const shares = liqPerShare.invert().quote(liquidity);

    const bRate = borrowRate({
      totalLiquidity: selectedLendgineInfo.data.totalLiquidity.subtract(
        liquidity
          ? liquidity
          : CurrencyAmount.fromRawAmount(selectedLendgine.lendgine, 0)
      ),
      totalLiquidityBorrowed:
        selectedLendgineInfo.data.totalLiquidityBorrowed.add(
          liquidity
            ? liquidity
            : CurrencyAmount.fromRawAmount(selectedLendgine.lendgine, 0)
        ),
    });
    return { price, borrowAmount, liquidity, shares, bRate };
  }, [
    parsedAmount,
    referencePrice,
    selectedLendgine,
    selectedLendgineInfo.data,
    settings.maxSlippagePercent,
  ]);

  const args = useMemo(
    () =>
      !!borrowAmount && !!parsedAmount && !!address && !!shares
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
              amountIn: BigNumber.from(parsedAmount.quotient.toString()),
              amountBorrow: BigNumber.from(borrowAmount.quotient.toString()),
              sharesMin: BigNumber.from(
                shares
                  .multiply(
                    ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent)
                  )
                  .quotient.toString()
              ),
              swapType: 0, // TODO: use reference price
              swapExtraData: AddressZero, // TODO: use reference price
              recipient: address,
              deadline: BigNumber.from(
                Math.round(Date.now() / 1000) + settings.timeout * 60
              ),
            },
          ] as const)
        : undefined,
    [
      address,
      borrowAmount,
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

  const prepareMint = usePrepareLendgineRouterMint({
    address: environment.base.lendgineRouter,
    args: args,
    enabled: !!borrowAmount && !!parsedAmount && !!address && !!shares,
  });

  const sendMint = useLendgineRouterMint(prepareMint.config);

  const disableReason = useMemo(
    () =>
      input === ""
        ? "Enter an amount"
        : !parsedAmount
        ? "Invalid amount"
        : !selectedLendgineInfo.data
        ? "Loading"
        : selectedLendgineInfo.data.totalLiquidity.equalTo(0)
        ? "Insufficient liquidity"
        : !liquidity || !shares || !approve.allowanceQuery.data
        ? "Loading"
        : liquidity.greaterThan(selectedLendgineInfo.data.totalLiquidity)
        ? "Insufficient liquidity"
        : null,
    [
      approve.allowanceQuery.data,
      input,
      liquidity,
      parsedAmount,
      selectedLendgineInfo.data,
      shares,
    ]
  );

  return (
    <>
      <AssetSelection
        tw="border-2 border-gray-200 rounded-lg "
        label={<span>Pay</span>}
        selectedValue={selectedLendgine.token1}
        inputValue={input}
        inputOnChange={(value) => setInput(value)}
        currentAmount={{
          amount: balance.data,
          allowSelect: true,
        }}
      />

      <BuyStats borrowRate={bRate ?? null} />

      <AsyncButton
        variant="primary"
        tw="h-12 text-xl font-bold items-center"
        disabled={!!disableReason}
        onClick={async () => {
          await Beet(
            [
              approve.beetStage,
              {
                stageTitle: `Buy ${selectedLendgine.token1.symbol}+`,
                parallelTransactions: [
                  {
                    title: `Buy ${selectedLendgine.token1.symbol}+`,
                    tx: {
                      prepare: prepareMint as ReturnType<
                        typeof usePrepareContractWrite
                      >,
                      send: sendMint,
                    },
                  },
                ],
              },
            ].filter((s) => !!s) as BeetStage[]
          );

          setInput("");
        }}
      >
        {disableReason ?? (
          <p>
            Buy {quote.symbol}
            {isLong ? "+" : "-"}
          </p>
        )}
      </AsyncButton>
    </>
  );
};
