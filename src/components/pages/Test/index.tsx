import { useAccount } from "wagmi";

import { useEnvironment } from "../../../contexts/environment2";
import { useBalance } from "../../../hooks/useBalance";
import { PageMargin } from "../../layout";

export const Test: React.FC = () => {
  const enviroment = useEnvironment();
  const { address } = useAccount();
  const balance = useBalance(enviroment.interface.wrappedNative, address);

  return (
    <PageMargin tw=" w-full max-w-4xl ">
      <div tw="w-full text-2xl text-black">
        {balance.isLoading
          ? "Loading"
          : balance.isError
          ? "Error"
          : balance.data?.toSignificant(4)}
      </div>
    </PageMargin>
  );
};
