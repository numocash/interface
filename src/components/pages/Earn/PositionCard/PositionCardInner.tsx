import { useState } from "react";
import tw, { css } from "twin.macro";

import type {
  IMarket,
  IMarketUserInfo,
} from "../../../../contexts/environment";
import { tickToAPR } from "../../../../utils/tick";
import { AddPosition } from "../AddPosition";
import { RemovePosition } from "../RemovePosition";

interface Props {
  market: IMarket;
  userInfo: IMarketUserInfo;
  isOpen: boolean;
}

export enum ActionType {
  Add = "Add",
  Remove = "Remove",
}

export const PositionCardInner: React.FC<Props> = ({
  market,
  userInfo,
}: Props) => {
  const [action, setAction] = useState<ActionType>(ActionType.Add);

  const Tabs = (
    <div tw="p-1 flex gap-0.5 grid-flow-col text-sm justify-center w-min rounded bg-action">
      {[ActionType.Add, ActionType.Remove].map((s) => {
        return (
          <div key={s}>
            <button
              css={css`
                ${tw`font-semibold px-4 py-2 rounded w-[120px] grid justify-items-center text-secondary`}
                ${tw`hover:(text-default)`}
                ${action === s && tw`text-default bg-container`}
              `}
              onClick={() => setAction(s)}
            >
              <span>{s}</span>
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <div tw="flex justify-start bg-action">
      {
        <div tw="grid md:grid-cols-2">
          <div tw="w-full flex items-start p-4 flex-col gap-4">
            {Tabs}
            {action === ActionType.Add ? (
              <AddPosition market={market} userInfo={userInfo} />
            ) : (
              <RemovePosition market={market} />
            )}
          </div>
          <div tw="flex flex-col gap-2">
            <div tw="sm:(flex-row gap-10) p-4">
              <div tw="flex font-semibold text-default border-b-2 border-container">
                <div tw="mb-4">
                  Numoen LP positions represent a share of the corresponding
                  Numoen liquidity pool. This share is then lent out.
                </div>
              </div>
              <div tw="gap-2">
                <div tw="flex flex-col sm:(flex-row gap-10) mt-2">
                  <div tw="flex-1 text-secondary">
                    <span>Upper Bound</span>
                  </div>
                  <div tw="flex-1 text-default font-semibold">
                    <span>{market.pair.bound.toFixed(2)}</span>{" "}
                    <span tw="text-secondary font-normal text-sm">
                      {market.pair.baseToken.symbol} /{" "}
                      {market.pair.speculativeToken.symbol}
                    </span>
                  </div>
                </div>
                <div tw="flex flex-col sm:(flex-row gap-10) mt-2">
                  <div tw="flex-1 text-secondary">
                    <span>Your Rate</span>
                  </div>
                  <div tw="flex-1 text-default font-semibold">
                    <span>{tickToAPR(userInfo.tick)}%</span>{" "}
                    <span tw="text-secondary font-normal text-sm">APR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
};
