import type { IMarket } from "@dahlia-labs/numoen-utils";
import { pairInterface } from "@dahlia-labs/numoen-utils";
import { TokenAmount } from "@dahlia-labs/token-utils";
import { pairInterface as uniPairInterface } from "@dahlia-labs/uniswapv2-utils";
import type { BigNumber } from "ethers";
import { utils } from "ethers";
import { useMemo } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import type { Position } from "../components/pages/Earn/Manage/Position";
import { useGetAddressToMarket } from "../contexts/environment";
import {
  convertShareToLiquidity,
  liquidityToSpeculative,
} from "../utils/Numoen/lendgineMath";
import { pricePerLP } from "../utils/Numoen/priceMath";
import type { HookArg } from "./useApproval";
import { useBlockQuery } from "./useBlockQuery";
import { useLendgineRouter } from "./useContract";
import { useLendgine, usePrice } from "./useLendgine";
import { usePair } from "./usePair";
import { useTokenBalance } from "./useTokenBalance";

const lendgineMintEvent = utils.id("Mint(address,address,uint256,uint256)");
const lendgineBurnEvent = utils.id("Burn(address,address,uint256,uint256)");
const uniSwapEvent = utils.id(
  "Swap(address,uint256,uint256,uint256,uint256,address)"
);
const pairMintEvent = utils.id("Mint(address,uint256)");
const pairBurnEvent = utils.id("Burn(address,uint256,uint256,uint256,address)");

export const usePositionValue = (
  address: HookArg<string>,
  market: HookArg<IMarket>
): TokenAmount | null => {
  const position = useTokenBalance(market?.token, address);
  const marketInfo = useLendgine(market);
  const pairInfo = usePair(market?.pair);
  const price = usePrice(market);
  return useMemo(() => {
    const liquidity =
      market && marketInfo && position
        ? convertShareToLiquidity(position, market, marketInfo)
        : null;
    const specCollateral =
      liquidity && market ? liquidityToSpeculative(liquidity, market) : null;
    const collateralValue =
      specCollateral && price ? specCollateral.multiply(price) : null;
    const pricePerLiquidity =
      pairInfo && market ? pricePerLP(pairInfo, market?.pair) : null;
    const debtValue =
      liquidity && pricePerLiquidity
        ? liquidity.multiply(pricePerLiquidity.asFraction)
        : null;

    const value =
      collateralValue && debtValue ? collateralValue.subtract(debtValue) : null;

    return market && value
      ? new TokenAmount(
          market.pair.baseToken,
          value.multiply(10 ** market.pair.baseScaleFactor).quotient
        )
      : null;
  }, [market, marketInfo, pairInfo, position, price]);
};

type Position = { market: IMarket; value: TokenAmount };

export const useMints = (): readonly Position[] | null => {
  const lendgineRouterContract = useLendgineRouter(false);
  const addressToMarket = useGetAddressToMarket();

  invariant(lendgineRouterContract);
  const { address } = useAccount();

  const mintFilter = lendgineRouterContract.filters.Mint(address);

  const filteredMintReceipts = useBlockQuery(
    ["trader mint events", address],
    async () => {
      const events = await lendgineRouterContract.queryFilter(mintFilter);
      const receipts = await Promise.all(
        events.map((e) => e.getTransactionReceipt())
      );
      return receipts;
    },
    !!address
  );

  return useMemo(() => {
    if (!filteredMintReceipts.data) return null;
    return filteredMintReceipts.data
      .map((fr) => {
        const mintEvent = fr.logs.find(
          (l) => l.topics && l.topics[0] === lendgineMintEvent
        );
        const burnEvent = fr.logs.find(
          (l) => l.topics && l.topics[0] === pairBurnEvent
        );

        invariant(mintEvent && burnEvent, "can't find event");
        const burnRet = pairInterface.decodeEventLog(
          "Burn",
          burnEvent.data
        ) as unknown as {
          amount0: BigNumber;
          amount1: BigNumber;
          liquidity: BigNumber;
        };

        const lendgineBytes = mintEvent.topics[2];
        invariant(lendgineBytes);
        const lendgineAddress = "0x" + lendgineBytes.slice(26);
        const market = addressToMarket(lendgineAddress);
        if (!market) return null;

        const liquidity = new TokenAmount(
          market.pair.lp,
          burnRet.liquidity.toString()
        );
        const specCollateral = liquidityToSpeculative(liquidity, market);
        const baseBurn = new TokenAmount(
          market.pair.baseToken,
          burnRet.amount0.toString()
        );
        const specBurn = new TokenAmount(
          market.pair.speculativeToken,
          burnRet.amount1.toString()
        );

        const scaleSpec = specBurn.divide(liquidity);
        const priceFraction = market.pair.bound.subtract(scaleSpec.divide(2));

        const collateralValue = priceFraction.multiply(specCollateral);
        const debtValue = baseBurn.asFraction.add(
          priceFraction.multiply(specBurn)
        );

        const positionValue = collateralValue.subtract(debtValue);
        return {
          market,
          value: new TokenAmount(
            market.pair.baseToken,
            positionValue.multiply(10 ** market.pair.baseScaleFactor).quotient
          ),
        };
      })
      .filter((f) => !!f) as Position[];
  }, [addressToMarket, filteredMintReceipts.data]);
};

export const useBurns = (): readonly Position[] | null => {
  const lendgineRouterContract = useLendgineRouter(false);
  const addressToMarket = useGetAddressToMarket();

  invariant(lendgineRouterContract);
  const { address } = useAccount();

  const burnFilter = lendgineRouterContract.filters.Burn(address);

  const filteredBurnReceipts = useBlockQuery(
    ["trader burn events", address],
    async () => {
      const events = await lendgineRouterContract.queryFilter(burnFilter);
      const receipts = await Promise.all(
        events.map((e) => e.getTransactionReceipt())
      );
      return receipts;
    },
    !!address
  );

  return useMemo(() => {
    if (!filteredBurnReceipts.data) return null;
    return filteredBurnReceipts.data
      .map((fr) => {
        const mintEvent = fr.logs.find(
          (l) => l.topics && l.topics[0] === pairMintEvent
        );
        const burnEvent = fr.logs.find(
          (l) => l.topics && l.topics[0] === lendgineBurnEvent
        );
        const swapEvent = fr.logs.find(
          (l) => l.topics && l.topics[0] === uniSwapEvent
        );
        invariant(swapEvent && burnEvent && mintEvent, "can't find event 2");

        const swap = uniPairInterface.decodeEventLog(
          "Swap",
          swapEvent.data
        ) as unknown as {
          amount0Out: BigNumber;
          amount1Out: BigNumber;
        };

        const mint = pairInterface.decodeEventLog(
          "Mint",
          mintEvent.data
        ) as unknown as { liquidity: BigNumber };

        const lendgineBytes = burnEvent.topics[2];
        invariant(lendgineBytes);
        const lendgineAddress = "0x" + lendgineBytes.slice(26);
        const market = addressToMarket(lendgineAddress);
        if (!market) return null;

        const baseFirst =
          market.pair.baseToken.address < market.pair.speculativeToken.address;

        const baseMint = new TokenAmount(
          market.pair.baseToken,
          baseFirst ? swap.amount0Out.toString() : swap.amount1Out.toString()
        );
        const specMint = new TokenAmount(
          market.pair.speculativeToken,
          baseFirst ? swap.amount1Out.toString() : swap.amount0Out.toString()
        );

        const liquidity = new TokenAmount(
          market.pair.lp,
          mint.liquidity.toString()
        );
        const specCollateral = liquidityToSpeculative(liquidity, market);

        const scaleSpec = specMint.divide(liquidity);
        const priceFraction = market.pair.bound.subtract(scaleSpec.divide(2));

        const collateralValue = priceFraction.multiply(specCollateral);
        const debtValue = baseMint.asFraction.add(
          priceFraction.multiply(specMint)
        );

        const positionValue = collateralValue.subtract(debtValue);
        return {
          market,
          value: new TokenAmount(
            market.pair.baseToken,
            positionValue.multiply(10 ** market.pair.baseScaleFactor).quotient
          ),
        };
      })
      .filter((f) => !!f) as Position[];
  }, [addressToMarket, filteredBurnReceipts.data]);
};

export const filterByMarket = (
  positions: readonly Position[],
  market: IMarket
): Position[] => positions.filter((p) => p.market === market);

export const sumMarket = (
  postions: readonly Position[],
  market: IMarket
): Position =>
  postions.reduce(
    (acc, cur) => ({
      market: acc.market,
      value: acc.value.add(cur.value),
    }),
    { market: market, value: new TokenAmount(market.pair.baseToken, 0) }
  );
