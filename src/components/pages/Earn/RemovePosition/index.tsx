import { useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { NavLink, useParams } from "react-router-dom";
import { createContainer } from "unstated-next";

import type { IMarket } from "../../../../contexts/environment";
import { useAddressToMarket } from "../../../../contexts/environment";
import { LoadingPage } from "../../../common/LoadingPage";
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

export const RemovePosition: React.FC = () => {
  const { marketAddress } = useParams<{
    marketAddress: string;
  }>();

  const market = useAddressToMarket(marketAddress ?? null);

  return market ? (
    <div tw="flex flex-col gap-3 max-w-2xl w-full">
      <NavLink to={`/pool`} tw="flex items-center text-xs">
        <div tw="text-xs flex gap-1.5 items-center text-default ">
          <FaChevronLeft />
          Back to pool list
        </div>
      </NavLink>
      <RemovePositionProvider initialState={{ market }}>
        <SelectRemove />
        <ConfirmButton />
      </RemovePositionProvider>
    </div>
  ) : (
    <LoadingPage />
  );
};
