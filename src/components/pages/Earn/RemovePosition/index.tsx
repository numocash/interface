import { useState } from "react";
import { createContainer } from "unstated-next";

import type {
  IMarket,
  IMarketUserInfo,
} from "../../../../contexts/environment";
import { ConfirmButton } from "./Button";
import { SelectRemove } from "./SelectRemove";

interface IRemovePosition {
  market: IMarket | null;
  userInfo: IMarketUserInfo | null;

  removePercent: number;
  setRemovePercent: (val: number) => void;
}

const useRemovePositionInternal = ({
  market,
  userInfo,
}: {
  market?: IMarket;
  userInfo?: IMarketUserInfo;
} = {}): IRemovePosition => {
  const [removePercent, setRemovePercent] = useState<number>(0);

  return {
    market: market ?? null,
    userInfo: userInfo ?? null,

    removePercent,
    setRemovePercent,
  };
};

export const {
  Provider: RemovePositionProvider,
  useContainer: useRemovePosition,
} = createContainer(useRemovePositionInternal);

interface Props {
  market: IMarket;
  userInfo: IMarketUserInfo;
}

export const RemovePosition: React.FC<Props> = ({ market, userInfo }) => {
  return (
    <div tw="flex flex-col gap-3 max-w-2xl w-full">
      <RemovePositionProvider initialState={{ market, userInfo }}>
        <SelectRemove />
        <ConfirmButton />
      </RemovePositionProvider>
    </div>
  );
};
