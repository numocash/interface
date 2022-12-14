import { Module } from "../../common/Module";

export const TradeStats: React.FC = () => {
  const data: { label: string; value: string }[] = [
    { label: "Leverage", value: "2x" },
    { label: "Liquidation Price", value: "No liquidation" },
  ];
  return (
    <Module tw="py-3 flex justify-around border-black">
      {data.map((d) => (
        <div key={d.label} tw="flex flex-col items-center text-center">
          <p tw="text-default font-bold">{d.value}</p>
          <p tw="text-sm text-secondary">{d.label}</p>
        </div>
      ))}
    </Module>
  );
};
