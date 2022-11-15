import { Fraction, TokenAmount } from "@dahlia-labs/token-utils";
import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

import type { IMarket } from "../../../../contexts/environment";
import { useAddressToMarket } from "../../../../contexts/environment";
import { useSettings } from "../../../../contexts/settings";
import { usePrice } from "../../../../hooks/useLendgine";
import { usePair } from "../../../../hooks/usePair";
import { Page } from "../../../common/Page";
import { Action } from "./Action";
import { Button } from "./Button";
import { useDeposit } from "./Deposit/useDeposit";
import { Invalid } from "./Invalid";
import { Position } from "./Position";
import { Top } from "./Top";
import { useWithdraw } from "./Withdraw/useWithdraw";

export enum ActionType {
  Deposit = "Deposit",
  Withdraw = "Withdraw",
}

export enum Input {
  Base,
  Speculative,
}

interface IManage {
  market: IMarket;
  tokenID?: number;

  action: ActionType;
  setAction: (val: ActionType) => void;

  withdrawPercent: number;
  setWithdrawPercent: (val: number) => void;

  baseAmount: TokenAmount | null;
  speculativeAmount: TokenAmount | null;
  setDepositAmount: (input: Input, val: TokenAmount) => void;

  onSend: () => Promise<void> | void;
  disableReason: string | null;
}

const useManageInternal = ({
  market,
  tokenID,
}: {
  market?: IMarket;
  tokenID?: number;
} = {}): IManage => {
  invariant(market, "market provider");

  const pairInfo = usePair(market.pair);

  const [action, setAction] = useState<ActionType>(ActionType.Deposit);

  const [withdrawPercent, setWithdrawPercent] = useState(25);
  const [baseAmount, setBaseAmount] = useState<TokenAmount | null>(null);
  const [speculativeAmount, setSpeculativeAmount] =
    useState<TokenAmount | null>(null);

  const price = usePrice(market);

  const setDepositAmount = useCallback(
    (input: Input, val: TokenAmount) => {
      if (!price || !pairInfo) return;
      input === Input.Base ? setBaseAmount(val) : setSpeculativeAmount(val);

      // TODO: change the input Token
      if (pairInfo.totalLPSupply.equalTo(0)) {
        input === Input.Base
          ? setSpeculativeAmount(
              new TokenAmount(
                market.pair.speculativeToken,
                val.scale(
                  market.pair.bound
                    .subtract(price)
                    .multiply(2)
                    .divide(price.asFraction.multiply(price))
                ).raw
              )
            )
          : setBaseAmount(
              new TokenAmount(
                market.pair.baseToken,
                val.scale(
                  price.asFraction
                    .multiply(price)
                    .divide(market.pair.bound.subtract(price).multiply(2))
                ).raw
              )
            );
      } else {
        const proportion =
          input === Input.Base
            ? new Fraction(val.raw, pairInfo.baseAmount.raw)
            : new Fraction(val.raw, pairInfo.speculativeAmount.raw);
        input === Input.Base
          ? setSpeculativeAmount(
              new TokenAmount(
                market.pair.speculativeToken,
                pairInfo.speculativeAmount.scale(proportion).raw
              )
            )
          : setBaseAmount(
              new TokenAmount(
                market.pair.baseToken,
                pairInfo.baseAmount.scale(proportion).raw
              )
            );
      }
    },
    [
      market.pair.baseToken,
      market.pair.bound,
      market.pair.speculativeToken,
      pairInfo,
      price,
    ]
  );

  const settings = useSettings();
  const { onSend: onSendDeposit, disableReason: disableReasonDeposit } =
    useDeposit(
      market,
      tokenID ?? null,
      baseAmount,
      speculativeAmount,
      settings
    );

  const { onSend: onSendWithdraw, disableReason: disableReasonWithdraw } =
    useWithdraw(market, tokenID ?? null, withdrawPercent, settings);

  return {
    market,
    tokenID,

    action,
    setAction,

    withdrawPercent,
    setWithdrawPercent,

    baseAmount,
    speculativeAmount,
    setDepositAmount,

    onSend: async () => {
      action === ActionType.Deposit
        ? await onSendDeposit()
        : await onSendWithdraw();
      action === ActionType.Deposit &&
        setBaseAmount(new TokenAmount(market.pair.baseToken, 0));
      action === ActionType.Deposit &&
        setSpeculativeAmount(new TokenAmount(market.pair.speculativeToken, 0));
    },
    disableReason:
      action === ActionType.Deposit
        ? disableReasonDeposit
        : disableReasonWithdraw,
  };
};

export const { Provider: ManageProvider, useContainer: useManage } =
  createContainer(useManageInternal);

export const Manage: React.FC = () => {
  const { lendgineAddress, tokenID } = useParams<{
    lendgineAddress: string;
    tokenID: string;
  }>();
  invariant(lendgineAddress, "pool address missing");

  const market = useAddressToMarket(lendgineAddress);

  return (
    <Page>
      {!market ? (
        <Invalid />
      ) : (
        <ManageProvider
          initialState={{ market, tokenID: tokenID ? +tokenID : undefined }}
        >
          <Top />
          {!!tokenID && <Position />}
          <Action />
          <Button />
        </ManageProvider>
      )}
    </Page>
  );
};
