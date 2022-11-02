import { useParams } from "react-router-dom";
import invariant from "tiny-invariant";
import { createContainer } from "unstated-next";

import type { IMarket } from "../../../../contexts/environment";
import { useAddressToMarket } from "../../../../contexts/environment";
import { Page } from "../../../common/Page";
import { Invalid } from "./Invalid";
import { Top } from "./Top";

interface IManage {
  market: IMarket;
}

const useManageInternal = ({
  market,
}: {
  market?: IMarket;
} = {}): IManage => {
  invariant(market, "market provider");
  return {
    market,
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
        </ManageProvider>
      )}
    </Page>
  );
};
