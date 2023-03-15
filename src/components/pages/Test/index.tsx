import { useAccount } from "wagmi";

import { useEnvironment } from "../../../contexts/environment2";
import { useBalances } from "../../../hooks/read/useBalance";
import { PageMargin } from "../../layout";

export const Test: React.FC = () => {
  const enviroment = useEnvironment();
  const { address } = useAccount();
  const balance = useBalances(
    [enviroment.interface.wrappedNative] as const,
    address
  );

  return (
    <PageMargin tw=" w-full max-w-4xl ">
      <div tw="w-full text-2xl text-black">
        {balance.isLoading
          ? "Loading"
          : balance.isError
          ? "Error"
          : balance.data?.[0]?.toSignificant(4)}
      </div>
    </PageMargin>
  );
};
