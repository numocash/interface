import { useTrade } from ".";
import { Divider, Loading } from "./Loading";
import { MarketItem } from "./MarketItem";

export const Markets: React.FC = () => {
  const { markets } = useTrade();

  return (
    <div tw="flex flex-col gap-2">
      {markets?.map((m, i) => (
        <div key={m[0].address + m[1].address} tw="gap-2 flex flex-col">
          {i !== 0 && <Divider />}
          <MarketItem tokens={m} />
        </div>
      )) ?? <Loading />}
    </div>
  );
};
