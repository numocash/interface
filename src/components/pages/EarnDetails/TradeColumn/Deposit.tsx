import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import { useCallback, useMemo, useState } from "react";
import type { usePrepareContractWrite } from "wagmi";
import { useAccount } from "wagmi";

import { useEnvironment } from "../../../../contexts/environment2";
import { useSettings } from "../../../../contexts/settings";
import {
  useLiquidityManagerAddLiquidity,
  usePrepareLiquidityManagerAddLiquidity,
} from "../../../../generated";
import { useApprove } from "../../../../hooks/useApproval";
import { useBalances } from "../../../../hooks/useBalance";
import { useLendgine } from "../../../../hooks/useLendgine";
import type { BeetStage } from "../../../../utils/beet";
import { useBeet } from "../../../../utils/beet";
import {
  accruedLendgineInfo,
  liquidityPerPosition,
} from "../../../../utils/Numoen/lendgineMath";
import {
  invert,
  priceToFraction,
  priceToReserves,
} from "../../../../utils/Numoen/price";
import { ONE_HUNDRED_PERCENT, scale } from "../../../../utils/Numoen/trade";
import tryParseCurrencyAmount from "../../../../utils/tryParseCurrencyAmount";
import { AssetSelection } from "../../../common/AssetSelection";
import { AsyncButton } from "../../../common/AsyncButton";
import { CenterSwitch } from "../../../common/CenterSwitch";
import { useEarnDetails } from "../EarnDetailsInner";

export const Deposit: React.FC = () => {
  const { address } = useAccount();
  const environment = useEnvironment();
  const Beet = useBeet();
  const settings = useSettings();
  const { selectedLendgine, base, quote, price } = useEarnDetails();
  const balances = useBalances([base, quote], address);
  const lendgineInfo = useLendgine(selectedLendgine);

  const [baseInput, setBaseInput] = useState("");
  const [quoteInput, setQuoteInput] = useState("");

  const { baseInputAmount, quoteInputAmount, liquidity, positionSize } =
    useMemo(() => {
      if (!lendgineInfo.data) {
        return {
          baseInputAmount: tryParseCurrencyAmount(baseInput, base),
          quoteInputAmount: tryParseCurrencyAmount(quoteInput, quote),
        };
      }

      const inverse = base.equals(selectedLendgine.token1);
      const parsedAmount =
        tryParseCurrencyAmount(baseInput, base) ??
        tryParseCurrencyAmount(quoteInput, quote);
      if (!parsedAmount) return {};

      const updatedInfo = accruedLendgineInfo(
        selectedLendgine,
        lendgineInfo.data
      );

      const liqPerPosition = liquidityPerPosition(
        selectedLendgine,
        updatedInfo
      );

      if (lendgineInfo.data.totalLiquidity.equalTo(0)) {
        const { token0Amount, token1Amount } = priceToReserves(
          selectedLendgine,
          inverse ? invert(price) : price
        );

        const liquidity = parsedAmount.currency.equals(selectedLendgine.token0)
          ? token0Amount.invert().quote(parsedAmount)
          : token1Amount.invert().quote(parsedAmount);

        const positionSize = liqPerPosition.invert().quote(liquidity);

        const baseInputAmount = inverse
          ? token1Amount.quote(liquidity)
          : token0Amount.quote(liquidity);
        const quoteInputAmount = inverse
          ? token0Amount.quote(liquidity)
          : token1Amount.quote(liquidity);

        return {
          liquidity,
          positionSize,
          baseInputAmount,
          quoteInputAmount,
        };
      }

      const [baseAmount, quoteAmount] = inverse
        ? [updatedInfo.reserve1, updatedInfo.reserve0]
        : [updatedInfo.reserve0, updatedInfo.reserve1];

      // determine percentage of pool
      const share = parsedAmount.currency.equals(base)
        ? parsedAmount.divide(baseAmount).asFraction
        : parsedAmount.divide(quoteAmount).asFraction;

      const liquidity = updatedInfo.totalLiquidity.multiply(share);

      const positionSize = liqPerPosition.invert().quote(liquidity);

      // TODO: make sure the tokens are correct
      return {
        baseInputAmount: baseAmount.multiply(share),
        quoteInputAmount: quoteAmount.multiply(share),
        liquidity,
        positionSize,
      };
    }, [
      base,
      baseInput,
      lendgineInfo.data,
      price,
      quote,
      quoteInput,
      selectedLendgine,
    ]);

  const onInput = useCallback(
    (value: string, field: "base" | "quote") => {
      if (lendgineInfo.isLoading) return;
      if (!lendgineInfo.data) {
        field === "base" ? setBaseInput(value) : setQuoteInput(value);
        return;
      }

      field === "base" ? setBaseInput(value) : setQuoteInput(value);
      field === "base" ? setQuoteInput("") : setBaseInput("");
    },
    [lendgineInfo.data, lendgineInfo.isLoading]
  );

  const approveBase = useApprove(
    baseInputAmount,
    environment.base.liquidityManager
  );
  const approveQuote = useApprove(
    quoteInputAmount,
    environment.base.liquidityManager
  );

  const args = useMemo(
    () =>
      !!baseInputAmount &&
      !!quoteInputAmount &&
      !!address &&
      !!liquidity &&
      !!lendgineInfo.data
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
              liquidity: BigNumber.from(
                liquidity.multiply(999999).divide(1000000).quotient.toString()
              ),
              amount0Min: BigNumber.from(
                (base.equals(selectedLendgine.token0)
                  ? baseInputAmount
                  : quoteInputAmount
                )
                  .multiply(
                    lendgineInfo.data.totalLiquidity.equalTo(0)
                      ? 1
                      : ONE_HUNDRED_PERCENT.subtract(
                          settings.maxSlippagePercent
                        )
                  )
                  .quotient.toString()
              ),
              amount1Min: BigNumber.from(
                (base.equals(selectedLendgine.token0)
                  ? quoteInputAmount
                  : baseInputAmount
                )
                  .multiply(
                    lendgineInfo.data.totalLiquidity.equalTo(0)
                      ? 1
                      : ONE_HUNDRED_PERCENT.subtract(
                          settings.maxSlippagePercent
                        )
                  )
                  .quotient.toString()
              ),
              sizeMin: BigNumber.from(
                positionSize
                  .multiply(
                    ONE_HUNDRED_PERCENT.subtract(settings.maxSlippagePercent)
                  )
                  .quotient.toString()
              ),

              recipient: address,
              deadline: BigNumber.from(
                Math.round(Date.now() / 1000) + settings.timeout * 60
              ),
            },
          ] as const)
        : undefined,
    [
      address,
      base,
      baseInputAmount,
      lendgineInfo.data,
      liquidity,
      positionSize,
      quoteInputAmount,
      selectedLendgine.bound,
      selectedLendgine.token0,
      selectedLendgine.token1.address,
      selectedLendgine.token1.decimals,
      settings.maxSlippagePercent,
      settings.timeout,
    ]
  );

  const prepareAdd = usePrepareLiquidityManagerAddLiquidity({
    address: environment.base.liquidityManager,
    args: args,
    enabled: !!args,
  });

  const sendAdd = useLiquidityManagerAddLiquidity(prepareAdd.config);

  const disableReason = useMemo(
    () =>
      lendgineInfo.isLoading
        ? "Loading"
        : // : lendgineInfo.data?.totalLiquidity.equalTo(0)
        // ? "No liquidity in pair"
        !baseInputAmount || !quoteInputAmount
        ? "Enter an amount"
        : balances.isLoading ||
          approveBase.allowanceQuery.isLoading ||
          approveQuote.allowanceQuery.isLoading
        ? "Loading"
        : (balances.data &&
            balances.data[0] &&
            baseInputAmount.greaterThan(balances.data[0])) ||
          (balances.data &&
            balances.data[1] &&
            quoteInputAmount.greaterThan(balances.data[1]))
        ? "Insufficient amount"
        : null,
    [
      approveBase.allowanceQuery.isLoading,
      approveQuote.allowanceQuery.isLoading,
      balances.data,
      balances.isLoading,
      baseInputAmount,
      lendgineInfo.isLoading,
      quoteInputAmount,
    ]
  );

  return (
    <>
      <div tw="flex flex-col rounded-lg border-2 border-stroke">
        <AssetSelection
          tw=""
          label={<span>Input</span>}
          selectedValue={base}
          inputValue={
            baseInput === ""
              ? baseInputAmount?.toSignificant(5) ?? ""
              : baseInput
          }
          inputOnChange={(value) => {
            onInput(value, "base");
          }}
          currentAmount={{
            amount: balances.data?.[0],
            allowSelect: true,
          }}
        />
        {/* <div tw="flex items-center justify-center self-center">
          <div tw=" justify-center items-center flex text-sm border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-stroke w-0" />
          <div tw="justify-center items-center flex text-sm border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[15px] border-b-stroke w-0 mt-[-30px]  " />
        </div> */}
        <div tw=" border-b-2 w-full border-stroke" />
        <CenterSwitch icon="plus" />
        <AssetSelection
          label={<span>Input</span>}
          tw="pt-2"
          selectedValue={quote}
          inputValue={
            quoteInput === ""
              ? quoteInputAmount?.toSignificant(5) ?? ""
              : quoteInput
          }
          inputOnChange={(value) => {
            onInput(value, "quote");
          }}
          currentAmount={{
            amount: balances.data?.[1],
            allowSelect: true,
          }}
        />
      </div>

      <AsyncButton
        variant="primary"
        disabled={!!disableReason}
        tw="mt-4 h-12 text-lg"
        onClick={async () => {
          await Beet(
            [
              approveBase.beetStage,
              approveQuote.beetStage,
              {
                stageTitle: `Add ${quote.symbol} / ${base.symbol} liquidty`,
                parallelTransactions: [
                  {
                    title: `Add ${quote.symbol} / ${base.symbol} liquidty`,
                    tx: {
                      prepare: prepareAdd as ReturnType<
                        typeof usePrepareContractWrite
                      >,
                      send: sendAdd,
                    },
                  },
                ],
              },
            ].filter((s): s is BeetStage => !!s)
          );

          onInput("", "base");
          onInput("", "quote");
        }}
      >
        {disableReason ?? "Add liquidity"}
      </AsyncButton>
    </>
  );
};
