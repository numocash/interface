import { TotalHistoryItems } from "./TotalHistoryItems";

export const TotalHistory: React.FC = () => {
  return (
    <div tw="flex flex-col h-full">
      <div tw="w-full text-secondary items-center grid-cols-3 sm:grid-cols-4 grid">
        <p tw="col-start-2 justify-self-end text-xs sm:text-sm">Value</p>
        <p tw="col-start-3 justify-self-end text-xs sm:text-sm">Price</p>
        <p tw="col-start-4 justify-self-end hidden sm:flex">Account</p>
      </div>
      <div tw="border-b border-gray-200 w-full" />
      <TotalHistoryItems />
    </div>
  );
};
