import { ChainId } from "@dahlia-labs/celo-contrib";
import { CELO, CUSD } from "@dahlia-labs/celo-tokens";
import { Token } from "@dahlia-labs/token-utils";
import { getAddress } from "@ethersproject/address";
import { useCallback } from "react";

import powerCELO from "../components/common/images/PowerCelo.svg";
import type { IMarket } from "../contexts/environment";
import { useEnvironment } from "../contexts/environment";

export const useCelo = () => CELO[ChainId.Mainnet];

export const useCusd = () => CUSD[ChainId.Mainnet];

export const useAddressToToken = (address: string | null): Token | null => {
  const tokens = [CELO[ChainId.Mainnet], CUSD[ChainId.Mainnet]] as const;
  if (!address) return null;
  return (
    tokens.find((t) => getAddress(t.address) === getAddress(address)) ?? null
  );
};

export const useFeaturedTokens = (): { [address: string]: Token } => {
  const celo = useCelo();
  return { [celo.address]: celo };
};

export const useMarketTokens = (): readonly Token[] => {
  return useEnvironment().markets.map(
    (m) =>
      new Token({
        chainId: ChainId.Mainnet,
        decimals: 36,
        name: `Squared ${m.pair.speculativeToken.symbol} / ${m.pair.baseToken.symbol}`,
        symbol: `${m.pair.speculativeToken.symbol}²`,
        address: m.address,
        logoURI: powerCELO,
      })
  );
};

export const useAllTokens = (): readonly Token[] => {
  const marketTokens = useMarketTokens();
  return [CELO[ChainId.Mainnet], ...marketTokens] as const;
};

export const getTokensPerMarket = (market: IMarket): [Token, Token] => {
  return [market.pair.speculativeToken, market.pair.baseToken];
};

export const useMarketsPerToken = (token: Token) => {
  const environments = useEnvironment();
  return useCallback(
    () =>
      environments.markets.filter(
        (m) => m.pair.baseToken === token || m.pair.speculativeToken === token
      ),
    [environments.markets, token]
  );
};
