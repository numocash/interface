import { useRive } from "@rive-app/react-canvas";

export const Explain: React.FC = () => {
  const rive = useRive({
    src: "safe.riv",
    autoplay: true,
    animations: ["Example"],
  });
  return (
    <div tw="w-full flex rounded-xl justify-between gap-4 items-center mt-[-1rem] mb-[-4rem] h-64">
      <ExplainItem
        title="Provide liquidity"
        description="Power tokens maintain constant leverage, through a novel mechanism of borrowing AMM shares."
      />
      <rive.RiveComponent tw="w-64 h-64" />
    </div>
  );
};

interface ExplainProps {
  title: string;
  description: string;
}
const ExplainItem: React.FC<ExplainProps> = ({
  title,
  description,
}: ExplainProps) => (
  <div tw="flex flex-col gap-2 col-span-2">
    <p tw="text-2xl font-semibold text-highlight">{title}</p>
    <p tw="text-paragraph">{description}</p>
  </div>
);
