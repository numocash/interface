import { getAddress } from "@ethersproject/address";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

import type { Lendgine } from "../../../constants";
import { useLendginesForTokens } from "../../../hooks/useLendgine";
import {
  useAddressToToken,
  useSortDenomTokens,
} from "../../../hooks/useTokens";
import type { WrappedTokenInfo } from "../../../hooks/useTokens2";
import { pickLongLendgines } from "../../../utils/lendgines";
import { DepositWithdraw } from "./DepositWithdraw";
import { EmptyPosition } from "./EmptyPosition";
import { History } from "./History";
import { Lendgines } from "./Lendgines";

interface IEarnDetails {
  base: WrappedTokenInfo;
  quote: WrappedTokenInfo;

  selectedLendgine: Lendgine;
  setSelectedLendgine: (val: Lendgine) => void;

  lendgines: Lendgine[];
}

const useEarnDetailsInternal = (): IEarnDetails => {
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
  if (!tokenA || !tokenB) navigate("/trade/");
  invariant(tokenA && tokenB);

  const [base, quote] = useSortDenomTokens([tokenA, tokenB] as const);

  // TODO: handle nonAddresses
  // TODO: verify correct ordering

  if (!base || !quote) navigate("/trade/");
  invariant(base && quote, "Invalid token addresses");

  const lendgines = useLendginesForTokens([base, quote] as const);
  invariant(lendgines);

  const longLendgine = pickLongLendgines(lendgines, base)[0];
  invariant(longLendgine);

  const [selectedLendgine, setSelectedLendgine] =
    useState<Lendgine>(longLendgine);

  return {
    base: base,
    quote: quote,
    lendgines,
    selectedLendgine,
    setSelectedLendgine,
  };
};

export const { Provider: EarnDetailsProvider, useContainer: useEarnDetails } =
  createContainer(useEarnDetailsInternal);

export const EarnDetails: React.FC = () => {
  return (
    <div tw="w-full flex flex-col max-w-3xl">
      <EarnDetailsProvider>
        <Lendgines />
        <DepositWithdraw />
        <History />
        <EmptyPosition />
      </EarnDetailsProvider>
    </div>
  );
};
