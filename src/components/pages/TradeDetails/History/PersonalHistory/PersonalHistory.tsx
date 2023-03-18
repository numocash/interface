import { useAccount } from "wagmi";

import { PersonalHistoryItems } from "./PersonalHistoryItems";

export const PersonalHistory: React.FC = () => {
  const { address } = useAccount();

  if (!address) return null;

  return (
    <>
      <div tw="w-full justify-between bg-secondary rounded-lg font-semibold h-12 items-center grid-cols-7 hidden md:grid">
        <p tw="col-start-3 col-span-2 justify-self-start">Value</p>
        <p tw="col-start-5 col-span-2 justify-self-start">Entry/Exit Price</p>
      </div>
      <PersonalHistoryItems user={address} />
    </>
  );
};
