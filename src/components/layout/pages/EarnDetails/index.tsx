import { getAddress } from "@ethersproject/address";
import { useNavigate, useParams } from "react-router-dom";
import invariant from "tiny-invariant";

import { useCurrentPrice } from "../../../../hooks/useExternalExchange";
import { useLendginesForTokens } from "../../../../hooks/useLendgine";
import { useAddressToToken } from "../../../../hooks/useTokens";
import { useSortDenomTokens } from "../../../../hooks/useTokens2";
import { LoadingPage } from "../../../common/LoadingPage";
import { EarnDetailsInner } from "./EarnDetailsInner";

export const EarnDetails: React.FC = () => {
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
  const priceQuery = useCurrentPrice(denomSortedTokens);

  return !!denomSortedTokens && !!lendgines && !!priceQuery.data ? (
    <EarnDetailsInner
      base={denomSortedTokens[0]}
      quote={denomSortedTokens[1]}
      lendgines={lendgines}
      price={priceQuery.data}
    />
  ) : (
    <LoadingPage />
  );
};
