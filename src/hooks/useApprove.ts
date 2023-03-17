import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import type { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { MaxUint256 } from "@uniswap/sdk-core";
import { useMemo } from "react";
import type { Address } from "wagmi";
import { erc20ABI, useAccount } from "wagmi";
import { prepareWriteContract, writeContract } from "wagmi/actions";

import { useSettings } from "../contexts/settings";
import type { BeetStage } from "../utils/beet";
import type { HookArg } from "./internal/utils";
import { useAllowance } from "./useAllowance";

export const useApprove = <T extends Token>(
  tokenAmount: HookArg<CurrencyAmount<T>>,
  spender: HookArg<Address>
) => {
  const settings = useSettings();
  const { address } = useAccount();

  const allowanceQuery = useAllowance(tokenAmount?.currency, address, spender);

  return useMemo(() => {
    if (!allowanceQuery.data || !tokenAmount || !spender) return {};

    const approvalRequired = tokenAmount.greaterThan(allowanceQuery.data);

    const tx = async () => {
      const config = await prepareWriteContract({
        address: getAddress(tokenAmount.currency.address),
        abi: erc20ABI,
        functionName: "approve",
        args: [
          spender,
          settings.infiniteApprove
            ? BigNumber.from(MaxUint256.toString())
            : BigNumber.from(tokenAmount.multiply(2).quotient.toString()),
        ],
      });
      const data = await writeContract(config);
      return data;
    };

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
          tx,
        },
      ],
    };

    return {
      allowanceQuery,
      beetStage: approvalRequired === true ? beetStage : null,
    };
  }, [allowanceQuery, settings.infiniteApprove, spender, tokenAmount]);
};
