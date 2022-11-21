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
import {
  baseToLiquidity,
  checkInvariant,
  liquidityToBase,
  liquidityToSpec,
  roundLiquidity,
  specToLiquidity,
} from "../../../../utils/trade";
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
  liquidity: TokenAmount | null;
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

  const [liquidity, setLiquidity] = useState<TokenAmount | null>(null);

  const price = usePrice(market);

  const setDepositAmount = useCallback(
    (input: Input, val: TokenAmount) => {
      if (!price || !pairInfo) return;
      input === Input.Base ? setBaseAmount(val) : setSpeculativeAmount(val);

      if (pairInfo.totalLPSupply.equalTo(0)) {
        if (input === Input.Base) {
          const liquidity = baseToLiquidity(val, price, market);
          const liquidityPrec = roundLiquidity(liquidity);
          const speculativeAmount = liquidityToSpec(
            liquidityPrec,
            price,
            market
          );
          const baseAmount = liquidityToBase(liquidityPrec, price, market);

          setBaseAmount(baseAmount);
          setSpeculativeAmount(speculativeAmount);
          setLiquidity(liquidityPrec);
          console.log(
            "add",
            checkInvariant(baseAmount, speculativeAmount, liquidityPrec, market)
          );
        } else {
          const liquidity = specToLiquidity(val, price, market);
          const liquidityPrec = roundLiquidity(liquidity);
          const speculativeAmount = liquidityToSpec(
            liquidityPrec,
            price,
            market
          );
          const baseAmount = liquidityToBase(liquidityPrec, price, market);

          setBaseAmount(baseAmount);
          setSpeculativeAmount(speculativeAmount);
          setLiquidity(liquidityPrec);

          console.log(
            "here",
            checkInvariant(baseAmount, speculativeAmount, liquidityPrec, market)
          );
        }
      } else {
        const proportion = new Fraction(
          val.raw,
          input === Input.Base
            ? pairInfo.baseAmount.raw
            : pairInfo.speculativeAmount.raw
        );
        const liquidity = pairInfo.totalLPSupply.scale(proportion);
        const liquidityPrec = roundLiquidity(liquidity);
        const baseAmount = pairInfo.baseAmount
          .scale(liquidityPrec)
          .scale(pairInfo.totalLPSupply.invert());
        const speculativeAmount = pairInfo.speculativeAmount
          .scale(liquidityPrec)
          .scale(pairInfo.totalLPSupply.invert());

        setBaseAmount(baseAmount);
        setSpeculativeAmount(speculativeAmount);
        setLiquidity(liquidityPrec);

        console.log(
          "increase",
          checkInvariant(
            baseAmount.add(pairInfo.baseAmount),
            speculativeAmount.add(pairInfo.speculativeAmount),
            liquidityPrec.add(pairInfo.totalLPSupply),
            market
          )
        );
      }
    },
    [market, pairInfo, price]
  );

  const settings = useSettings();
  const { onSend: onSendDeposit, disableReason: disableReasonDeposit } =
    useDeposit(
      market,
      tokenID ?? null,
      baseAmount,
      speculativeAmount,
      liquidity,
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
    liquidity,
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
