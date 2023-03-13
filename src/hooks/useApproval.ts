import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import type { Token } from "@uniswap/sdk-core";
import { CurrencyAmount, MaxUint256 } from "@uniswap/sdk-core";
import { useMemo } from "react";
import type { Address, usePrepareContractWrite } from "wagmi";
import { useAccount } from "wagmi";

import { useSettings } from "../contexts/settings";
import {
  useErc20Allowance,
  useErc20Approve,
  usePrepareErc20Approve,
} from "../generated";
import type { BeetStage } from "../utils/beet";
import { ONE_HUNDRED_PERCENT } from "../utils/Numoen/trade";
import type { HookArg } from "./useBalance";
import { useWatchQuery } from "./useBalance";

export const useAllowance = <T extends Token>(
  token: HookArg<T>,
  address: HookArg<Address>,
  spender: HookArg<Address>
) => {
  useWatchQuery("erc20Allowance");
  return useErc20Allowance({
    address: token ? getAddress(token.address) : undefined,
    args: address && spender ? [address, spender] : undefined,
    staleTime: Infinity,
    enabled: !!token && !!address && !!spender,
    select: (data) =>
      token ? CurrencyAmount.fromRawAmount(token, data.toString()) : undefined,
    scopeKey: "erc20Allowance",
  });
};

export const useApprove = <T extends Token>(
  tokenAmount: HookArg<CurrencyAmount<T>>,
  spender: HookArg<Address>
) => {
  const settings = useSettings();
  const { address } = useAccount();

  const allowanceQuery = useAllowance(tokenAmount?.currency, address, spender);

  const approvalRequired = useMemo(
    () =>
      allowanceQuery.data && tokenAmount
        ? tokenAmount.greaterThan(allowanceQuery.data)
        : null,
    [allowanceQuery.data, tokenAmount]
  );

  // const approvalRequired = true;
  // return null if approval is already met
  // return a Beet Transaction
  const prepare = usePrepareErc20Approve({
    args:
      !!tokenAmount && !!spender
        ? [
            spender,
            settings.infiniteApprove
              ? BigNumber.from(MaxUint256.toString())
              : BigNumber.from(
                  tokenAmount
                    .multiply(
                      ONE_HUNDRED_PERCENT.add(settings.maxSlippagePercent)
                    )
                    .quotient.toString()
                ),
          ]
        : undefined,
    address: tokenAmount ? getAddress(tokenAmount.currency.address) : undefined,
    enabled: !!tokenAmount && !!spender,
    staleTime: Infinity,
  });

  const write = useErc20Approve(prepare.config);

  const title = `Approve  ${
    settings.infiniteApprove
      ? "infinite"
      : tokenAmount?.toSignificant(5, { groupSeparator: "," }) ?? ""
  } ${tokenAmount?.currency.symbol ?? ""}`;

  const beetStage: BeetStage = {
    stageTitle: title,
    parallelTransactions: [
      {
        title,
        tx: {
          prepare: prepare as ReturnType<typeof usePrepareContractWrite>,
          send: write,
        },
      },
    ],
  };

  return {
    prepare: prepare as ReturnType<typeof usePrepareContractWrite>,
    write,
    allowanceQuery,
    beetStage: approvalRequired === true ? beetStage : null,
  };
};
