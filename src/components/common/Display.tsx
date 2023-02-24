interface Props {
  numMarkets?: number;
}
export const Display: React.FC<Props> = ({ numMarkets }: Props) => {
  return (
    <div tw="text-xs text-paragraph flex gap-1">
      Displaying
      {numMarkets ? (
        <span tw="font-semibold">
          {numMarkets} market{numMarkets !== 1 ? "s" : ""}
        </span>
      ) : (
        <div tw="h-3 w-12 rounded-lg bg-secondary transform ease-in-out animate-pulse" />
      )}
    </div>
  );
};
