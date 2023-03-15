import { useEarn } from ".";
import { Loading } from "./Loading";
import { MarketItem } from "./MarketItems";

export const Markets: React.FC = () => {
  const { markets } = useEarn();

  return (
    <div tw="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {!!markets && markets.length !== 0 ? (
        markets?.map((m) => (
          <MarketItem market={m} key={`${m[0].address}/${m[1].address}`} />
        ))
      ) : (
        <Loading />
      )}
    </div>
  );
};
