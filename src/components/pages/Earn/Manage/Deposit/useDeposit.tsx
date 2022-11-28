import type { IMarket } from "@dahlia-labs/numoen-utils";
import {
  LIQUIDITYMANAGER,
  liquidityManagerInterface,
} from "@dahlia-labs/numoen-utils";
import type { TokenAmount } from "@dahlia-labs/token-utils";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import type { ISettings } from "../../../../../contexts/settings";
import { useApproval, useApprove } from "../../../../../hooks/useApproval";
import { useChain } from "../../../../../hooks/useChain";
import { useLiquidityManager } from "../../../../../hooks/useContract";
import { useNextTokenID, usePrice } from "../../../../../hooks/useLendgine";
import { usePair } from "../../../../../hooks/usePair";
import { useWrappedTokenBalance } from "../../../../../hooks/useTokenBalance";
import { useGetIsWrappedNative } from "../../../../../hooks/useTokens";
import type { BeetStage, BeetTx } from "../../../../../utils/beet";
import { useBeet } from "../../../../../utils/beet";
import { scale } from "../../../Trade/useTrade";

export const useDeposit = (
  market: IMarket,
  tokenID: number | null,
  baseTokenAmount: TokenAmount | null,
  speculativeTokenAmount: TokenAmount | null,
  liquidity: TokenAmount | null,
  settings: ISettings
): { onSend: () => Promise<void>; disableReason: string | null } => {
  const liquidityManagerContract = useLiquidityManager(true);
  const Beet = useBeet();
  const { address } = useAccount();
  const pairInfo = usePair(market.pair);
  const price = usePrice(market);
  const nextID = useNextTokenID();
  const navigate = useNavigate();
  const chain = useChain();
  const isNative = useGetIsWrappedNative();

  const balanceBase = useWrappedTokenBalance(market.pair.baseToken);
  const balanceSpeculative = useWrappedTokenBalance(
    market.pair.speculativeToken
  );

  const approvalS = useApproval(
    speculativeTokenAmount,
    address,
    LIQUIDITYMANAGER[chain]
  );
  const approvalB = useApproval(
    baseTokenAmount,
    address,
    LIQUIDITYMANAGER[chain]
  );
  const approveS = useApprove(speculativeTokenAmount, LIQUIDITYMANAGER[chain]);

  const approveB = useApprove(baseTokenAmount, LIQUIDITYMANAGER[chain]);

  const disableReason = useMemo(
    () =>
      !baseTokenAmount || !speculativeTokenAmount
        ? "Enter an amount"
        : baseTokenAmount.equalTo(0) && speculativeTokenAmount.equalTo(0)
        ? "Enter an amount"
        : !balanceBase ||
          !balanceSpeculative ||
          approvalS === null ||
          approvalB === null ||
          !price ||
          !liquidity ||
          nextID === null
        ? "Loading..."
        : (balanceSpeculative &&
            speculativeTokenAmount.greaterThan(balanceSpeculative)) ||
          (balanceBase && baseTokenAmount.greaterThan(balanceBase))
        ? "Insufficient funds"
        : null,
    [
      baseTokenAmount,
      speculativeTokenAmount,
      balanceBase,
      balanceSpeculative,
      approvalS,
      approvalB,
      price,
      liquidity,
      nextID,
    ]
  );

  const onSend = async () => {
    invariant(
      liquidityManagerContract &&
        speculativeTokenAmount &&
        baseTokenAmount &&
        liquidity
    );

    const approveStage: BeetStage[] =
      approvalS || approvalB
        ? [
            {
              stageTitle: "Approve tokens",
              parallelTransactions: [
                approvalS
                  ? {
                      title: `Approve ${speculativeTokenAmount.token.symbol}`,
                      description: `Approve ${speculativeTokenAmount.toFixed(
                        2,
                        {
                          groupSeparator: ",",
                        }
                      )} ${speculativeTokenAmount.token.symbol}`,
                      txEnvelope: approveS,
                    }
                  : null,
                approvalB
                  ? {
                      title: `Approve ${baseTokenAmount.token.symbol}`,
                      description: `Approve ${baseTokenAmount.toFixed(2, {
                        groupSeparator: ",",
                      })} ${baseTokenAmount.token.symbol}`,
                      txEnvelope: approveB,
                    }
                  : null,
              ].filter((t) => t !== null) as BeetTx[],
            },
          ]
        : [];

    invariant(address && pairInfo && nextID !== null && price);

    console.log(
      baseTokenAmount.raw.toString(),
      speculativeTokenAmount.raw.toString(),
      liquidity.raw.toString()
    );

    if (!tokenID) {
      const mintParams = {
        base: market.pair.baseToken.address,
        speculative: market.pair.speculativeToken.address,
        baseScaleFactor: market.pair.baseScaleFactor,
        speculativeScaleFactor: market.pair.speculativeScaleFactor,
        upperBound: market.pair.bound.asFraction
          .multiply(scale)
          .quotient.toString(),
        amount0Min: pairInfo.totalLPSupply.equalTo(0)
          ? baseTokenAmount.raw.toString()
          : baseTokenAmount
              .reduceBy(settings.maxSlippagePercent)
              .raw.toString(),
        amount1Min: pairInfo.totalLPSupply.equalTo(0)
          ? speculativeTokenAmount.raw.toString()
          : speculativeTokenAmount
              .reduceBy(settings.maxSlippagePercent)
              .raw.toString(),
        liquidity: liquidity.raw.toString(),
        recipient: address,
        deadline: Math.round(Date.now() / 1000) + settings.timeout * 60,
      };

      await Beet(
        "Add liquidity to pool",
        approveStage.concat({
          stageTitle: "Add liquidity to pool",
          parallelTransactions: [
            {
              title: "Add liquidity to pool",
              description: "Add liquidity to pool",
              txEnvelope: () =>
                isNative(market.pair.baseToken) ||
                isNative(market.pair.speculativeToken)
                  ? liquidityManagerContract.multicall(
                      [
                        liquidityManagerContract.interface.encodeFunctionData(
                          "mint",
                          [mintParams]
                        ),
                        liquidityManagerContract.interface.encodeFunctionData(
                          "refundETH"
                        ),
                      ],
                      {
                        value: isNative(market.pair.baseToken)
                          ? baseTokenAmount.raw.toString()
                          : isNative(market.pair.speculativeToken)
                          ? speculativeTokenAmount.raw.toString()
                          : 0,
                      }
                    )
                  : liquidityManagerContract.mint(mintParams),
            },
          ],
        })
      );
    } else {
      const increaseParams = {
        tokenID,
        amount0Min: baseTokenAmount
          .reduceBy(settings.maxSlippagePercent)
          .raw.toString(),
        amount1Min: speculativeTokenAmount
          .reduceBy(settings.maxSlippagePercent)
          .raw.toString(),
        liquidity: liquidity.raw.toString(),
        deadline: Math.round(Date.now() / 1000) + settings.timeout * 60,
      };
      await Beet(
        "Add liquidity to pool",
        approveStage.concat({
          stageTitle: "Add liquidity to pool",
          parallelTransactions: [
            {
              title: "Add liquidity to pool",
              description: "Add liquidity to pool",
              txEnvelope: () =>
                isNative(market.pair.baseToken) ||
                isNative(market.pair.speculativeToken)
                  ? liquidityManagerContract.multicall(
                      [
                        liquidityManagerInterface.encodeFunctionData(
                          "increaseLiquidity",
                          [increaseParams]
                        ),
                        liquidityManagerInterface.encodeFunctionData(
                          "refundETH"
                        ),
                      ],
                      {
                        value: isNative(market.pair.baseToken)
                          ? baseTokenAmount.raw.toString()
                          : isNative(market.pair.speculativeToken)
                          ? speculativeTokenAmount.raw.toString()
                          : 0,
                      }
                    )
                  : liquidityManagerContract.increaseLiquidity(increaseParams),
            },
          ],
        })
      );
    }

    if (!tokenID) {
      navigate(`/earn/${market.address}/${nextID + 1}/`);
    }

    // TODO: only navigate if no error
    // TODO: clear out the forms
  };

  return {
    disableReason,
    onSend,
  };
};
