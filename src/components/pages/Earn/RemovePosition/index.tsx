import { useState } from "react";
import { createContainer } from "unstated-next";

import type { IMarket } from "../../../../contexts/environment";
import { ConfirmButton } from "./Button";
import { SelectRemove } from "./SelectRemove";

interface IRemovePosition {
  market: IMarket | null;

  removePercent: number;
  setRemovePercent: (val: number) => void;
}

const useRemovePositionInternal = ({
  market,
}: {
  market?: IMarket;
} = {}): IRemovePosition => {
  const [removePercent, setRemovePercent] = useState<number>(0);

  return {
    market: market ?? null,

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
}

export const RemovePosition: React.FC<Props> = ({ market }) => {
  return (
    <div tw="flex flex-col gap-3 max-w-2xl w-full">
      <RemovePositionProvider initialState={{ market }}>
        <SelectRemove />
        <ConfirmButton />
      </RemovePositionProvider>
    </div>
  );
};
