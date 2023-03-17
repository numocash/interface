import { getAddress } from "@ethersproject/address";
import { useNavigate, useParams } from "react-router-dom";
import invariant from "tiny-invariant";

import { useEnvironment } from "../../../contexts/useEnvironment";
import { useCurrentPrice } from "../../../hooks/useExternalExchange";
import { useLendginesForTokens } from "../../../hooks/useLendgine";
import { useAddressToToken } from "../../../hooks/useTokens";
import { isValidMarket } from "../../../lib/lendgineValidity";
import { LoadingPage } from "../../common/LoadingPage";
import { TradeDetailsInner } from "./TradeDetailsInner";

export const TradeDetails: React.FC = () => {
  const navigate = useNavigate();
  const environment = useEnvironment();

  const { base, quote } = useParams<{
    base: string;
    quote: string;
  }>();
  if (!base || !quote) navigate("/trade/");
  invariant(base && quote);

  // if they aren't addresses
  try {
    getAddress(base);
    getAddress(quote);
  } catch (err) {
    console.error(err);
    navigate("/trade/");
  }

  const baseToken = useAddressToToken(base);
  const quoteToken = useAddressToToken(quote);

  // if they aren't in the token list
  if (!baseToken || !quoteToken) navigate("/trade/");
  invariant(baseToken && quoteToken);

  // if the market isn't valid
  const market = [baseToken, quoteToken] as const;

  if (
    !isValidMarket(
      market,
      environment.interface.wrappedNative,
      environment.interface.specialtyMarkets
    )
  )
    navigate("/trade/");

  const lendgines = useLendginesForTokens(market);
  const priceQuery = useCurrentPrice(market);

  return !!lendgines && !!priceQuery.data ? (
    <TradeDetailsInner
      base={baseToken}
      quote={quoteToken}
      lendgines={lendgines}
      price={priceQuery.data}
    />
  ) : (
    <LoadingPage />
  );
};
