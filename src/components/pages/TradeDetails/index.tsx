import { getAddress } from "@ethersproject/address";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import invariant from "tiny-invariant";

import { useMostLiquidMarket } from "../../../hooks/useExternalExchange";
import { useLendginesForTokens } from "../../../hooks/useLendgine";
import { useAddressToToken } from "../../../hooks/useTokens";
import { useSortDenomTokens } from "../../../hooks/useTokens2";
import { LoadingPage } from "../../common/LoadingPage";
import { TradeDetailsInner } from "./TradeDetailsInner";

export const TradeDetails: React.FC = () => {
  const navigate = useNavigate();

  const { addressA, addressB } = useParams<{
    addressA: string;
    addressB: string;
  }>();
  if (!addressA || !addressB) navigate("/trade/");
  invariant(addressA && addressB);

  try {
    getAddress(addressA);
    getAddress(addressB);
  } catch (err) {
    console.error(err);
    navigate("/trade/");
  }

  const tokenA = useAddressToToken(addressA);
  const tokenB = useAddressToToken(addressB);

  const denomSortedTokens = useSortDenomTokens(
    !!tokenA && !!tokenB ? ([tokenA, tokenB] as const) : null
  );
  const lendgines = useLendginesForTokens(denomSortedTokens);
  const mostLiquidQuery = useMostLiquidMarket(denomSortedTokens);
  const invertPriceQuery = denomSortedTokens
    ? denomSortedTokens[1].sortsBefore(denomSortedTokens[0])
    : null;

  const currentPrice = useMemo(() => {
    if (!mostLiquidQuery.data) return null;
    return invertPriceQuery
      ? mostLiquidQuery.data.price.invert()
      : mostLiquidQuery.data.price;
  }, [invertPriceQuery, mostLiquidQuery.data]);

  return !!denomSortedTokens &&
    !!lendgines &&
    !!currentPrice &&
    !!mostLiquidQuery.data?.pool ? (
    <TradeDetailsInner
      base={denomSortedTokens[0]}
      quote={denomSortedTokens[1]}
      lendgines={lendgines}
      price={currentPrice}
      pool={mostLiquidQuery.data.pool}
    />
  ) : (
    <LoadingPage />
  );
};
