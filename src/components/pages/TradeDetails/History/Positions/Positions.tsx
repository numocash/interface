import { useAccount } from "wagmi";

import { PositionItems } from "./PositionItems";

export const Positions: React.FC = () => {
  const { address } = useAccount();

  if (!address)
    return (
      <div tw="w-full rounded-lg bg-gray-100  text-gray-500 justify-center py-2 flex font-semibold">
        Connect Wallet
      </div>
    );

  return (
    <div tw="flex flex-col">
      <div tw="w-full text-secondary items-center grid-cols-3 sm:grid-cols-5 grid">
        <p tw=" col-start-2 justify-self-end">Value</p>
        <p tw=" justify-self-end hidden sm:( grid)">Returns</p>

        <p tw="hidden sm:( grid) justify-self-end">Funding APR</p>
      </div>
      <div tw="border-b border-gray-200 w-full" />
      <PositionItems address={address} />
    </div>
  );
};
