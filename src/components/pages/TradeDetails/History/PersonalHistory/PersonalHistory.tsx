import { useAccount } from "wagmi";

import { PersonalHistoryItems } from "./PersonalHistoryItems";

export const PersonalHistory: React.FC = () => {
  const { address } = useAccount();

  if (!address)
    return (
      <div tw="w-full rounded-lg bg-gray-100  text-gray-500 justify-center py-2 flex font-semibold">
        Connect Wallet
      </div>
    );

  return (
    <div tw="flex flex-col h-full">
      <div tw="w-full text-secondary items-center grid-cols-3 grid">
        <p tw="col-start-2 justify-self-end text-xs sm:text-sm">Value</p>
        <p tw="col-start-3 justify-self-end text-xs sm:text-sm">Price</p>
      </div>
      <div tw="border-b border-gray-200 w-full" />
      <PersonalHistoryItems user={address} />
    </div>
  );
};