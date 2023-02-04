import { useTrade } from ".";

export const Display: React.FC = () => {
  const { lendgines } = useTrade();

  return (
    <p tw="text-xs text-default">
      Displaying{" "}
      <span tw="font-semibold">
        {lendgines.length} market{lendgines.length !== 1 ? "s" : ""}
      </span>
    </p>
  );
};
