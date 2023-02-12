interface Props {
  numMarkets: number;
}
export const Display: React.FC<Props> = ({ numMarkets }: Props) => {
  return (
    <p tw="text-xs text-default">
      Displaying{" "}
      <span tw="font-semibold">
        {numMarkets} market{numMarkets !== 1 ? "s" : ""}
      </span>
    </p>
  );
};
