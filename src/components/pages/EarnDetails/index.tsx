import { utils } from "ethers";
import { useNavigate, useParams } from "react-router-dom";
import invariant from "tiny-invariant";

import { useEnvironment } from "../../../contexts/useEnvironment";
import { useCurrentPrice } from "../../../hooks/useExternalExchange";
import { useLendginesForTokens } from "../../../hooks/useLendgine";
import { useAddressToToken } from "../../../hooks/useTokens";
import { isValidMarket } from "../../../lib/lendgineValidity";
import { LoadingPage } from "../../common/LoadingPage";
import { EarnDetailsInner } from "./EarnDetailsInner";

export const EarnDetails: React.FC = () => {
  const navigate = useNavigate();
  const environment = useEnvironment();

  const { base, quote } = useParams<{
    base: string;
    quote: string;
  }>();
  if (!base || !quote) navigate("/earn/");
  invariant(base && quote);

  // if they aren't addresses
  try {
    utils.getAddress(base);
    utils.getAddress(quote);
  } catch (err) {
    console.error(err);
    navigate("/trade/");
  }

  const baseToken = useAddressToToken(base);
  const quoteToken = useAddressToToken(quote);

  // if they aren't in the token list
  if (!baseToken || !quoteToken) navigate("/earn/");
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
    navigate("/earn/");

  const lendgines = useLendginesForTokens(market);
  const priceQuery = useCurrentPrice(market);

  return !!lendgines && !!priceQuery.data ? (
    <EarnDetailsInner
      base={baseToken}
      quote={quoteToken}
      lendgines={lendgines}
      price={priceQuery.data}
    />
  ) : (
    <LoadingPage />
  );
};
