export const Stats: React.FC = () => {
  // const environment = useEnvironment();
  return (
    <div tw="flex w-full justify-around">
      <Item label="Total deposited" item={"102 MATIC"} />
      <Item label="Max APR" item={"99%"} />
      <Item label="Balance" item={"0 MATIC"} />
    </div>
  );
};

interface ItemProps {
  label: string;
  item: React.ReactNode;
}

const Item: React.FC<ItemProps> = ({ label, item }: ItemProps) => {
  return (
    <div tw="flex flex-col gap-1 items-center">
      <p tw="text-secondary text-sm">{label}</p>
      <div tw="text-2xl font-semibold">{item}</div>
    </div>
  );
};
