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
      <PersonalHistoryItems user={address} />
    </div>
  );
};
