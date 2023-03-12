import { getAddress } from "@ethersproject/address";
import type { Currency as UniCurrency, Token } from "@uniswap/sdk-core";
import type { TokenInfo, TokenList } from "@uniswap/token-lists";
import invariant from "tiny-invariant";

import UniswapTokens from "../constants/tokenList/uniswap.json";
import { useEnvironment } from "../contexts/environment2";
import type { HookArg } from "./useBalance";
import { useChain } from "./useChain";
import { isEqualToMarket } from "./useMarket";
import { useGetIsWrappedNative } from "./useTokens";

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

  equals(other: UniCurrency): boolean {
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

// export const useTokenSymbol = (token: WrappedTokenInfo): string => {
//   const environment = useEnvironment();
// return token.equals(environment.interface.wrappedNative)
// }

// export const useDefaultTokenListQueryKey = () => {
//   const environment = useEnvironment();
//   return ["token list", environment.interface.defaultActiveLists] as const;
// };

// export const useDefaultTokenListQueryFn = () => {
//   const environment = useEnvironment();
//   const chain = useChain();
//   return useCallback(async () => {
//     const lists = await Promise.all(
//       environment.interface.defaultActiveLists.map((l) =>
//         axios.get<TokenList>(l)
//       )
//     );
//     return dedupeTokens(
//       lists.flatMap((l) => l.data.tokens).filter((t) => t.chainId === chain)
//     ).map((t) => new WrappedTokenInfo(t));
//   }, [chain, environment.interface.defaultActiveLists]);
// };

export const useDefaultTokenList = () => {
  const chain = useChain();
  const isWrappedNative = useGetIsWrappedNative();
  const enviroment = useEnvironment();

  return dedupeTokens(
    (UniswapTokens.tokens as TokenInfo[]).filter((t) => t.chainId === chain)
  ).map((t) => {
    const token = new WrappedTokenInfo(t);
    if (isWrappedNative(token)) {
      invariant(enviroment.interface.native);
      return new WrappedTokenInfo({
        ...t,
        name: enviroment.interface.native.name ?? t.name,
        symbol: enviroment.interface.native.symbol ?? t.symbol,
      });
    }
    return token;
  });
};

export const useSortDenomTokens = (
  tokens: HookArg<readonly [WrappedTokenInfo, WrappedTokenInfo]>
) => {
  const environment = useEnvironment();
  if (!tokens) return null;
  const specialtyMatches = environment.interface.specialtyMarkets?.find((m) =>
    isEqualToMarket(tokens[0], tokens[1], m)
  );

  if (specialtyMatches)
    return [
      tokens[0].equals(specialtyMatches[0]) ? tokens[0] : tokens[1],
      tokens[0].equals(specialtyMatches[0]) ? tokens[1] : tokens[0],
    ] as const;

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
