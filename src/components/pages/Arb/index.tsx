import { useEnvironment } from "../../../contexts/environment";
import { ArbCard } from "./ArbCard";

export const Arb: React.FC = () => {
  const { markets } = useEnvironment();

  return (
    <div tw="grid md:grid-cols-2  gap-6">
      {markets.map((m) => (
        <ArbCard market={m} key={m.address} />
      ))}
    </div>
  );
};
