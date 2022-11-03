import type { TokenAmount } from "@dahlia-labs/token-utils";
import { useState } from "react";
import { useParams } from "react-router-dom";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

import type { IMarket } from "../../../../contexts/environment";
import { useAddressToMarket } from "../../../../contexts/environment";
import { useSettings } from "../../../../contexts/settings";
import { Page } from "../../../common/Page";
import { Action } from "./Action";
import { Button } from "./Button";
import { Invalid } from "./Invalid";
import { Position } from "./Position";
import { Top } from "./Top";
import { useDeposit } from "./useDeposit";

export enum ActionType {
  Deposit = "Deposit",
  Withdraw = "Withdraw",
}

interface IManage {
  market: IMarket;

  action: ActionType;
  setAction: (val: ActionType) => void;

  withdrawPercent: number;
  setWithdrawPercent: (val: number) => void;

  depositBaseAmount: TokenAmount | null;
  setDepositBaseAmount: (val: TokenAmount) => void;
  depositSpeculativeAmount: TokenAmount | null;
  setDepositSpeculativeAmount: (val: TokenAmount) => void;

  onSend: () => Promise<void> | void;
  disableReason: string | null;
}

const useManageInternal = ({
  market,
}: {
  market?: IMarket;
} = {}): IManage => {
  invariant(market, "market provider");

  const [action, setAction] = useState<ActionType>(ActionType.Deposit);

  const [withdrawPercent, setWithdrawPercent] = useState(25);
  const [depositBaseAmount, setDepositBaseAmount] =
    useState<TokenAmount | null>(null);
  const [depositSpeculativeAmount, setDepositSpeculativeAmount] =
    useState<TokenAmount | null>(null);

  const settings = useSettings();
  const { onSend, disableReason } = useDeposit(
    market,
    // null,
    depositBaseAmount,
    depositSpeculativeAmount,
    settings
  );
  return {
    market,

    action,
    setAction,

    withdrawPercent,
    setWithdrawPercent,

    depositBaseAmount,
    setDepositBaseAmount,
    depositSpeculativeAmount,
    setDepositSpeculativeAmount,

    onSend,
    disableReason,
  };
};

export const { Provider: ManageProvider, useContainer: useManage } =
  createContainer(useManageInternal);

export const Manage: React.FC = () => {
  const { lendgineAddress } = useParams<{
    lendgineAddress: string;
  }>();
  invariant(lendgineAddress, "pool address missing");
  // TODO: don't error when address is wrong

  const market = useAddressToMarket(lendgineAddress);

  return (
    <Page>
      {!market ? (
        <Invalid />
      ) : (
        <ManageProvider initialState={{ market }}>
          <Top />
          <Position />
          <Action />
          <Button />
        </ManageProvider>
      )}
    </Page>
  );
};
