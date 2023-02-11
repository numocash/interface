interface Props {
  label: string;
  item: React.ReactElement | string;
  className?: string;
}
export const VerticalItem: React.FC<Props> = ({
  label,
  item,
  className,
}: Props) => {
  return (
    <div tw="flex flex-col" className={className}>
      {typeof item === "string" ? (
        <p tw="font-semibold text-lg">{item}</p>
      ) : (
        item
      )}
      <p tw="text-secondary text-sm">{label}</p>
    </div>
  );
};
