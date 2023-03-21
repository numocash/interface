import { useTrade } from ".";
import { Loading } from "./Loading";
import { MarketItem } from "./MarketItem";

export const Markets: React.FC = () => {
  const { markets } = useTrade();

  return (
    <div tw="w-full max-w-5xl justify-self-center items-center flex flex-col  gap-2">
      {!!markets && markets.length !== 0 ? (
        markets.map((m) => (
          <div
            key={m[0].address + m[1].address}
            tw="gap-2 flex flex-col w-full"
          >
            <MarketItem tokens={m} />
          </div>
        ))
      ) : (
        <Loading />
      )}
    </div>
  );
};
