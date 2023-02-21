import { getAddress } from "@ethersproject/address";
import { useQuery } from "@tanstack/react-query";
import type { Currency, Token } from "@uniswap/sdk-core";
import type { TokenInfo, TokenList } from "@uniswap/token-lists";
import axios from "axios";
import { useCallback } from "react";

import { useEnvironment } from "../contexts/environment2";
import { useChain } from "./useChain";

export const dedupeTokens = <T extends Token | TokenInfo>(
  tokens: readonly T[]
): readonly T[] => {
  const seen = new Set<string>();
  return tokens.filter((token) => {
    const tokenID = `${token.address}_${token.chainId}`;
    if (seen.has(tokenID)) {
      return false;
    } else {
      seen.add(tokenID);
      return true;
    }
  });
};

/**
 * Token instances created from token info on a token list.
 */
export class WrappedTokenInfo implements Token {
  readonly isNative = false as const;
  readonly isToken = true as const;
  readonly list?: TokenList;
  readonly tokenInfo: TokenInfo;

  private _checksummedAddress: string;

  constructor(tokenInfo: TokenInfo, list?: TokenList) {
    this.tokenInfo = tokenInfo;
    this.list = list;
    const checksummedAddress = getAddress(this.tokenInfo.address);
    if (!checksummedAddress) {
      throw new Error(`Invalid token address: ${this.tokenInfo.address}`);
    }
    this._checksummedAddress = checksummedAddress;
  }

  get address(): string {
    return this._checksummedAddress;
  }

  get chainId(): number {
    return this.tokenInfo.chainId;
  }

  get decimals(): number {
    return this.tokenInfo.decimals;
  }

  get name(): string {
    return this.tokenInfo.name;
  }

  get symbol(): string {
    return this.tokenInfo.symbol;
  }

  get logoURI(): string | undefined {
    return this.tokenInfo.logoURI;
  }

  equals(other: Currency): boolean {
    return (
      other.chainId === this.chainId &&
      other.isToken &&
      other.address.toLowerCase() === this.address.toLowerCase()
    );
  }

  sortsBefore(other: Token): boolean {
    if (this.equals(other)) throw new Error("Addresses should not be equal");
    return this.address.toLowerCase() < other.address.toLowerCase();
  }

  get wrapped(): Token {
    return this;
  }
}

export const useDefaultTokenListQueryKey = () => {
  const environment = useEnvironment();
  return ["token list", environment.interface.defaultActiveLists] as const;
};

export const useDefaultTokenListQueryFn = () => {
  const environment = useEnvironment();
  const chain = useChain();
  return useCallback(async () => {
    const lists = await Promise.all(
      environment.interface.defaultActiveLists.map((l) =>
        axios.get<TokenList>(l)
      )
    );
    return dedupeTokens(
      lists.flatMap((l) => l.data.tokens).filter((t) => t.chainId === chain)
    ).map((t) => new WrappedTokenInfo(t));
  }, [chain, environment.interface.defaultActiveLists]);
};

export const useDefaultTokenList = () => {
  const queryKey = useDefaultTokenListQueryKey();
  const queryFn = useDefaultTokenListQueryFn();

  return useQuery<readonly WrappedTokenInfo[]>(queryKey, queryFn, {
    staleTime: Infinity,
  });
};

export const useSortDenomTokens = (
  tokens: readonly [WrappedTokenInfo, WrappedTokenInfo]
) => {
  const environment = useEnvironment();
  if (
    tokens[0].equals(environment.interface.stablecoin) ||
    tokens[1].equals(environment.interface.stablecoin)
  ) {
    return tokens[0].equals(environment.interface.stablecoin)
      ? tokens
      : ([tokens[1], tokens[0]] as const);
  }
  return tokens[0].equals(environment.interface.wrappedNative)
    ? tokens
    : ([tokens[1], tokens[0]] as const);
};
