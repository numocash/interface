import { useMemo } from "react";

import { Button } from "../../../common/Button";
import { useCreatePair } from ".";

export const SendButton: React.FC = () => {
  const {
    speculativeToken,
    baseToken,
    bound,
    speculativeTokenAmount,
    baseTokenAmount,
  } = useCreatePair();

  //loading, insufficient balance
  const disableReason = useMemo(
    () =>
      !speculativeToken || !baseToken
        ? "Select a token"
        : !baseTokenAmount || !speculativeTokenAmount
        ? "Enter an amount"
        : baseTokenAmount?.equalTo(0) && speculativeTokenAmount?.equalTo(0)
        ? "Enter an amount"
        : !bound
        ? "Select an upper bound"
        : null,
    [
      baseToken,
      baseTokenAmount,
      bound,
      speculativeToken,
      speculativeTokenAmount,
    ]
  );
  return (
    <Button variant="primary" disabled={!!disableReason} tw="max-w-md">
      {disableReason ?? "Preview Transaction"}
    </Button>
  );
};
