import { useTrade } from ".";

export const Display: React.FC = () => {
  const { markets } = useTrade();

  return (
    <p tw="text-xs text-default">
      Displaying{" "}
      <span tw="font-semibold">
        {markets.length} market{markets.length !== 1 ? "s" : ""}
      </span>
    </p>
  );
};
