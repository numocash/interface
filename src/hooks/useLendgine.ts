import { TokenAmount } from "@dahlia-labs/token-utils";
import type { Call } from "@dahlia-labs/use-ethers";
import { AbiCoder } from "@ethersproject/abi";
import type { BigNumber } from "@ethersproject/bignumber";
import { keccak256 } from "ethers/lib/utils";
import invariant from "tiny-invariant";

import type { IMarket, IMarketUserInfo } from "../contexts/environment";
import { parseFunctionReturn } from "../utils/parseFunctionReturn";
import { useBlockQuery } from "./useBlockQuery";
import { useLendgineContract } from "./useContract";

export const useLendgine = (
  address: string | undefined,
  market: IMarket
): IMarketUserInfo | null => {
  const lendgineContract = useLendgineContract(market.address, false);
  invariant(lendgineContract);
  const abiCoder = new AbiCoder();

  const bytes = abiCoder.encode(["address"], [address]);

  const call: Call = {
    target: market.address,
    callData: lendgineContract.interface.encodeFunctionData("positions", [
      keccak256(bytes),
    ]),
  };

  const data = useBlockQuery(
    "lendgine",
    [call],
    [market.address, address],
    !!address
  );
  if (!data) return null;

  interface LendgineRet {
    liquidity: BigNumber;
  }

  const ret = parseFunctionReturn(
    lendgineContract.interface,
    "positions",
    data.returnData[0]
  ) as unknown as LendgineRet;

  return {
    liquidity: new TokenAmount(market.pair.lp, ret.liquidity.toString()),
  };
};
