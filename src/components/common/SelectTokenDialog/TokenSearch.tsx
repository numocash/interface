import { CurrencyAmount } from "@uniswap/sdk-core";
import Fuse from "fuse.js";
import { zip } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { useDebounce } from "use-debounce";
import { useAccount } from "wagmi";

import { useBalances } from "../../../hooks/useBalance";
import type { WrappedTokenInfo } from "../../../hooks/useTokens2";
import { LoadingSpinner } from "../LoadingSpinner";
import { SearchInput } from "./SearchInput";
import { TokenResults } from "./TokenResults";

interface TokenSearchProps {
  isOpen: boolean;
  tokens?: readonly WrappedTokenInfo[];

  onSelect?: (value: WrappedTokenInfo) => void;
  selectedToken?: WrappedTokenInfo;
}

export const TokenSearch: React.FC<TokenSearchProps> = ({
  isOpen,
  tokens,
  onSelect,
  // showManageView,
  selectedToken,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { address } = useAccount();

  const [searchQueryDebounced] = useDebounce(searchQuery, 200, {
    leading: true,
  });
  // const debouncedQueryKey = getAddress(searchQueryDebounced);
  // const searchToken = useToken2(debouncedQueryKey);

  const userTokenBalances = useBalances(tokens, address);

  const tokensWithBalances = useMemo(
    () =>
      !tokens
        ? []
        : userTokenBalances
        ? zip(userTokenBalances, tokens)
            .map(([tokenBalance, t]) => {
              invariant(t, "token");

              const balance = tokenBalance;
              if (balance) {
                return { token: t, balance, hasBalance: !balance.equalTo("0") };
              }
              return {
                token: t,
                balance: CurrencyAmount.fromRawAmount(t, 0),
                hasBalance: false,
              };
            })
            .sort((a, b) => {
              if (!a.hasBalance && b.hasBalance) {
                return 1;
              } else if (a.hasBalance && !b.hasBalance) {
                return -1;
              } else if (a.hasBalance && b.hasBalance) {
                return a.balance.greaterThan(b.balance) ? -1 : 1;
              } else {
                if (a.token.symbol > b.token.symbol) {
                  return 1;
                } else {
                  return -1;
                }
              }
            })
        : address === null
        ? tokens.map((t) => ({
            token: t,
            balance: CurrencyAmount.fromRawAmount(t, 0),
            hasBalance: false,
          }))
        : [],
    [userTokenBalances, tokens, address]
  );

  const fuse = useMemo(
    () =>
      new Fuse(tokensWithBalances, {
        keys: ["token.address", "token.name", "token.symbol"],
      }),
    [tokensWithBalances]
  );

  const { results } = useMemo(() => {
    const searchResults = fuse.search(searchQueryDebounced).map((r) => r.item);

    return searchQuery.length === 0
      ? { results: tokensWithBalances }
      : { results: searchResults };
  }, [searchQuery, fuse, searchQueryDebounced, tokensWithBalances]);

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery("");
  }, [isOpen]);

  return (
    <div tw={"relative flex flex-col flex-1 p-0"}>
      {/*<div*/}
      {/*  onClick={onDismiss}*/}
      {/*  tw="fixed inset-0 bg-black bg-opacity-75"*/}
      {/*  aria-hidden="true"*/}
      {/*/>*/}

      <div tw="p-4 flex flex-col gap-4">
        <div tw="flex items-center justify-between">
          <div tw="font-semibold text-base text-default">Select a token</div>
        </div>
        <div>
          <SearchInput
            onChange={(value) => setSearchQuery(value)}
            searchQuery={searchQuery}
            onClear={() => setSearchQuery("")}
          />
          {/* <FavoriteTokens onSelect={(token) => onSelect?.(token)} /> */}
        </div>
      </div>

      <div tw={"overflow-y-scroll flex-1"}>
        {(results.length === 0 || !tokens) && (
          <div tw={"p-8 w-full flex items-center justify-center"}>
            <LoadingSpinner />
          </div>
        )}
        {/* {!loading && results.length === 0 && !searchToken && (
          <div tw="py-[3rem]">
            <div tw="text-center">Nothing Found</div>
          </div>
        )} */}

        {results.length > 0 && (
          <TokenResults
            selectedToken={selectedToken}
            results={results}
            onSelect={onSelect}
          />
        )}
      </div>
      <div tw="p-4 py-2 bg-white flex justify-between text-default">
        <div tw="text-sm">{results.length} Tokens</div>
        <div tw="flex items-center space-x-1.5">
          <div tw="text-sm font-semibold">Numoen Token Browser</div>
        </div>
      </div>
    </div>
  );
};
