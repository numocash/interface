import { defaultAbiCoder } from "@ethersproject/abi";
import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { useMemo, useState } from "react";
import type { Address, usePrepareContractWrite } from "wagmi";
import { useAccount } from "wagmi";

import { useEnvironment } from "../../../../contexts/environment2";
import { useSettings } from "../../../../contexts/settings";
import {
  useLendgineRouterMint,
  usePrepareLendgineRouterMint,
} from "../../../../generated";
import { useApprove } from "../../../../hooks/useApproval";
import { useBalance } from "../../../../hooks/useBalance";
import {
  isV3,
  useMostLiquidMarket,
} from "../../../../hooks/useExternalExchange";
import { useLendgine } from "../../../../hooks/useLendgine";
import type { BeetStage } from "../../../../utils/beet";
import { useBeet } from "../../../../utils/beet";
import { isLongLendgine } from "../../../../utils/lendgines";
import { borrowRate } from "../../../../utils/Numoen/jumprate";
import {
  accruedLendgineInfo,
  getT,
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
    pool,
    price: referencPrice,
  } = useTradeDetails();
  const isLong = isLongLendgine(selectedLendgine, base);
  const Beet = useBeet();
  const { address } = useAccount();
  const environment = useEnvironment();
  const settings = useSettings();
  const t = getT();

  const selectedLendgineInfo = useLendgine(selectedLendgine);
  const mostLiquid = useMostLiquidMarket([base, quote]);

  const [input, setInput] = useState("");
  const balance = useBalance(selectedLendgine.token1, address);

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(input, selectedLendgine.token1),
    [input, selectedLendgine.token1]
  );
  const approve = useApprove(parsedAmount, environment.base.lendgineRouter);
  const { borrowAmount, liquidity, shares, bRate } = useMemo(() => {
    if (selectedLendgineInfo.data?.totalLiquidity.equalTo(0)) return {};
    if (!selectedLendgineInfo.data) return {};
    const updatedLendgineInfo = accruedLendgineInfo(
      selectedLendgine,
      selectedLendgineInfo.data,
      t
    );

    const price = numoenPrice(selectedLendgine, updatedLendgineInfo);
    const liqPerShare = liquidityPerShare(
      selectedLendgine,
      updatedLendgineInfo
    );
    const liqPerCol = liquidityPerCollateral(selectedLendgine);

    const borrowAmount = parsedAmount
      ? determineBorrowAmount(
          parsedAmount,
          selectedLendgine,
          updatedLendgineInfo,
          { pool, price: referencPrice },
          settings.maxSlippagePercent
        )
      : undefined;

    const liquidity =
      borrowAmount && parsedAmount
        ? liqPerCol.quote(borrowAmount.add(parsedAmount))
        : undefined;

    const shares = liquidity
      ? liqPerShare.invert().quote(liquidity)
      : undefined;

    const bRate = borrowRate({
      totalLiquidity: updatedLendgineInfo.totalLiquidity.subtract(
        liquidity
          ? liquidity
          : CurrencyAmount.fromRawAmount(selectedLendgine.lendgine, 0)
      ),
      totalLiquidityBorrowed: updatedLendgineInfo.totalLiquidityBorrowed.add(
        liquidity
          ? liquidity
          : CurrencyAmount.fromRawAmount(selectedLendgine.lendgine, 0)
      ),
    });

    return { price, borrowAmount, liquidity, shares, bRate };
  }, [
    parsedAmount,
    pool,
    referencPrice,
    selectedLendgine,
    selectedLendgineInfo.data,
    settings.maxSlippagePercent,
    t,
  ]);

  const args = useMemo(
    () =>
      !!borrowAmount &&
      !!parsedAmount &&
      !!address &&
      !!shares &&
      !!mostLiquid.data
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
              swapType: isV3(mostLiquid.data.pool) ? 1 : 0,
              swapExtraData: isV3(mostLiquid.data.pool)
                ? (defaultAbiCoder.encode(
                    ["tuple(uint24 fee)"],
                    [
                      {
                        fee: +mostLiquid.data.pool.feeTier,
                      },
                    ]
                  ) as Address)
                : AddressZero,
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
      mostLiquid.data,
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
        tw="border-2 border-stroke rounded-lg "
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
