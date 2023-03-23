import { TotalHistoryItems } from "./TotalHistoryItems";

export const TotalHistory: React.FC = () => {
  return (
    <div tw="flex flex-col h-full">
      <div tw="w-full text-secondary items-center grid-cols-4 grid">
        <p tw="col-start-2 justify-self-end">Value</p>
        <p tw="col-start-3 justify-self-end">Entry/Exit Price</p>
        <p tw="col-start-4 justify-self-end">Account</p>
      </div>
      <div tw="border-b border-gray-200 w-full" />
      <TotalHistoryItems />
    </div>
  );
};
