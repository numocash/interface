import { useQuery } from "@tanstack/react-query";
import { Fraction, Price } from "@uniswap/sdk-core";
import { utils } from "ethers";
import JSBI from "jsbi";
import { useMemo } from "react";
import invariant from "tiny-invariant";
import { objectKeys } from "ts-extras";
import type { Address } from "wagmi";

import { uniswapV2PairABI } from "../abis/uniswapV2Pair";
import { uniswapV3PoolABI } from "../abis/uniswapV3Pool";
import type { Times } from "../components/pages/TradeDetails/Chart/TimeSelector";
import { useEnvironment } from "../contexts/useEnvironment";
import type {
  PriceHistoryDayV2Query,
  PriceHistoryHourV2Query,
} from "../gql/uniswapV2/graphql";
import {
  PairV2Document,
  PriceHistoryDayV2Document,
  PriceHistoryHourV2Document,
} from "../gql/uniswapV2/graphql";
import type {
  PriceHistoryDayV3Query,
  PriceHistoryHourV3Query,
} from "../gql/uniswapV3/graphql";
import {
  MostLiquidV3Document,
  PriceHistoryDayV3Document,
  PriceHistoryHourV3Document,
} from "../gql/uniswapV3/graphql";
import { fractionToPrice, priceToFraction } from "../lib/price";
import type { Market } from "../lib/types/market";
import type { WrappedTokenInfo } from "../lib/types/wrappedTokenInfo";
import type { UniswapV2Pool } from "../services/graphql/uniswapV2";
import {
  parsePairV2,
  parsePriceHistoryDayV2,
  parsePriceHistoryHourV2,
} from "../services/graphql/uniswapV2";
import type { UniswapV3Pool } from "../services/graphql/uniswapV3";
import {
  feeTiers,
  parseMostLiquidV3,
  parsePriceHistoryDayV3,
  parsePriceHistoryHourV3,
  Q192,
} from "../services/graphql/uniswapV3";
import { useContractRead } from "./internal/useContractRead";
import { useContractReads } from "./internal/useContractReads";
import type { HookArg } from "./internal/utils";
import { useChain } from "./useChain";
import { useClient } from "./useClient";

export const isV3 = (t: UniswapV2Pool | UniswapV3Pool): t is UniswapV3Pool =>
  "feeTier" in t;

export const useMostLiquidMarket = (tokens: HookArg<Market>) => {
  const client = useClient();
  const sortedTokens = tokens
    ? tokens[0].sortsBefore(tokens[1])
      ? ([tokens[0], tokens[1]] as const)
      : ([tokens[1], tokens[0]] as const)
    : null;

  const chain = useChain();

  // TODO: look into wagmi query caching
  return useQuery<{
    pool: UniswapV2Pool | UniswapV3Pool;
  } | null>(
    ["query liquidity", sortedTokens?.map((t) => t.address)],
    async () => {
      if (!sortedTokens) return null;

      const variables = {
        token0: sortedTokens[0].address.toLowerCase(),
        token1: sortedTokens[1].address.toLowerCase(),
      };

      const [v2, v3] = await Promise.all([
        client.uniswapV2.request(PairV2Document, variables),
        client.uniswapV3.request(MostLiquidV3Document, variables),
      ] as const);

      const v2data = parsePairV2(v2, sortedTokens);
      const v3data = parseMostLiquidV3(v3, sortedTokens);

      if (!v2data && !v3data) return null;

      if (chain === 42220) {
        if (!v3data) return null;
        invariant(v2data);
        return {
          pool: v3data.pool,
        };
      }

      if (!v3data) {
        invariant(v2data);
        return { pool: v2data.pool };
      }

      if (!v2data) {
        invariant(v3data);
        return { pool: v3data.pool };
      }

      return {
        pool:
          v2data.totalLiquidity > v3data.totalLiquidity
            ? v2data.pool
            : v3data.pool,
      };
    },
    {
      staleTime: Infinity,
      refetchInterval: 5_000,
    }
  );
};

export const usePriceHistory = (
  externalExchange: HookArg<UniswapV2Pool | UniswapV3Pool>,
  timeframe: keyof typeof Times
) => {
  const client = useClient();
  const chain = useChain();

  return useQuery(
    ["price history", externalExchange?.address, timeframe, chain],
    async () => {
      if (!externalExchange) return null;

      const variables = {
        id: externalExchange.address.toLowerCase(),
        amount:
          timeframe === "ONE_DAY"
            ? 24
            : timeframe === "ONE_WEEK"
            ? 24 * 7
            : timeframe === "THREE_MONTH"
            ? 92
            : 365,
      };

      const priceHistory =
        timeframe === "ONE_DAY" || timeframe === "ONE_WEEK"
          ? isV3(externalExchange)
            ? await client.uniswapV3.request(
                PriceHistoryHourV3Document,
                variables
              )
            : await client.uniswapV2.request(
                PriceHistoryHourV2Document,
                variables
              )
          : isV3(externalExchange)
          ? await client.uniswapV3.request(PriceHistoryDayV3Document, variables)
          : await client.uniswapV2.request(
              PriceHistoryDayV2Document,
              variables
            );

      const isV2 = (
        t: typeof priceHistory
      ): t is PriceHistoryHourV2Query | PriceHistoryDayV2Query => {
        return "pair" in t;
      };

      const isHourV2 = (
        t: PriceHistoryHourV2Query | PriceHistoryDayV2Query
      ): t is PriceHistoryHourV2Query =>
        t.pair ? "hourData" in t.pair : false;

      const isHourV3 = (
        t: PriceHistoryHourV3Query | PriceHistoryDayV3Query
      ): t is PriceHistoryHourV3Query =>
        t.pool ? "poolHourData" in t.pool : false;

      return isV2(priceHistory)
        ? priceHistory.pair
          ? isHourV2(priceHistory)
            ? parsePriceHistoryHourV2(priceHistory)
            : parsePriceHistoryDayV2(priceHistory)
          : null
        : priceHistory.pool
        ? isHourV3(priceHistory)
          ? parsePriceHistoryHourV3(priceHistory)
          : parsePriceHistoryDayV3(priceHistory)
        : null;
    },
    {
      staleTime: Infinity,
      refetchInterval: 10 * 60_000,
    }
  );
};

export const useCurrentPrice = (tokens: HookArg<Market>) => {
  const v2PriceQuery = useV2Price(tokens);
  const v3PricesQuery = useV3Prices(tokens);

  return useMemo(() => {
    if (v2PriceQuery.status === "loading" || v3PricesQuery.status === "loading")
      return { status: "loading" };

    if (
      !v2PriceQuery.data &&
      (!v3PricesQuery.data || v3PricesQuery.data.length === 0)
    )
      return { status: "error" };

    invariant(tokens);

    // console.log(
    //   v2PriceQuery.data?.toSignificant(4),
    //   v3PricesQuery.data?.map((t) => t?.toSignificant(4))
    // );

    const allPrices = [v2PriceQuery.data]
      .concat(v3PricesQuery.data)
      .filter((d): d is Price<WrappedTokenInfo, WrappedTokenInfo> => !!d)
      .sort((a, b) => (a.greaterThan(b) ? 1 : -1));

    if (allPrices.length % 2 === 1) {
      return {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        data: allPrices[(allPrices.length - 1) / 2]!,
        status: "success",
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const lower = allPrices[allPrices.length / 2 - 1]!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const upper = allPrices[allPrices.length / 2]!;

    const sum = priceToFraction(lower).add(priceToFraction(upper));
    return {
      data: fractionToPrice(sum.divide(2), tokens[1], tokens[0]),
      status: "success",
    };
  }, [tokens, v2PriceQuery, v3PricesQuery]);
};

const useV2Price = (tokens: HookArg<Market>) => {
  const environment = useEnvironment();

  const { token0, v2PairAddress } = useMemo(() => {
    if (!tokens) return {};
    const [token0, token1] = tokens[0].sortsBefore(tokens[1])
      ? [tokens[0], tokens[1]]
      : [tokens[1], tokens[0]]; // does safety checks
    const v2PairAddress = utils.getCreate2Address(
      environment.interface.uniswapV2.factoryAddress,
      utils.keccak256(
        utils.solidityPack(
          ["address", "address"],
          [token0.address, token1.address]
        )
      ),
      environment.interface.uniswapV2.pairInitCodeHash
    );

    return { token0, token1, v2PairAddress };
  }, [
    environment.interface.uniswapV2.factoryAddress,
    environment.interface.uniswapV2.pairInitCodeHash,
    tokens,
  ]);

  return useContractRead({
    address: (v2PairAddress as Address) ?? undefined,
    staleTime: 3_000,
    enabled: !!v2PairAddress,
    abi: uniswapV2PairABI,
    functionName: "getReserves",
    watch: true,
    select: (data) => {
      if (!tokens) return undefined;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const invert = !token0!.equals(tokens[0]);
      const priceFraction = new Fraction(
        data.reserve0.toString(),
        data.reserve1.toString()
      );
      return new Price(
        tokens[1],
        tokens[0],
        invert ? priceFraction.numerator : priceFraction.denominator,
        invert ? priceFraction.denominator : priceFraction.numerator
      );
    },
  });
};

const useV3Prices = (tokens: HookArg<Market>) => {
  const environment = useEnvironment();

  const { token0, contracts } = useMemo(() => {
    if (!tokens) return {};
    const [token0, token1] = tokens[0].sortsBefore(tokens[1])
      ? [tokens[0], tokens[1]]
      : [tokens[1], tokens[0]]; // does safety checks
    const calcAddress = (feeTier: UniswapV3Pool["feeTier"]) =>
      utils.getCreate2Address(
        environment.interface.uniswapV3.factoryAddress,
        utils.keccak256(
          utils.defaultAbiCoder.encode(
            ["address", "address", "uint24"],
            [token0.address, token1.address, feeTier]
          )
        ),
        environment.interface.uniswapV3.pairInitCodeHash
      );

    const contracts = objectKeys(feeTiers).map(
      (fee) =>
        ({
          address: calcAddress(fee) as Address,
          functionName: "slot0",
          abi: uniswapV3PoolABI,
        } as const)
    );

    return { token0, token1, contracts };
  }, [
    environment.interface.uniswapV3.factoryAddress,
    environment.interface.uniswapV3.pairInitCodeHash,
    tokens,
  ]);

  return useContractReads({
    contracts,
    allowFailure: true,
    staleTime: 3_000,
    enabled: !!contracts,
    watch: true,
    select: (data) => {
      invariant(tokens && token0);

      const invert = token0.equals(tokens[0]);

      return data.map((slot) => {
        if (!slot) return undefined;
        const sqrtPriceX96 = JSBI.BigInt(slot.sqrtPriceX96.toString());

        const priceFraction = new Fraction(
          JSBI.multiply(sqrtPriceX96, sqrtPriceX96),
          Q192
        );

        return new Price(
          tokens[1],
          tokens[0],
          invert ? priceFraction.numerator : priceFraction.denominator,
          invert ? priceFraction.denominator : priceFraction.numerator
        );
      });
    },
  });
};
