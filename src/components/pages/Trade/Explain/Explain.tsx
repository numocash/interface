import Rive from "@rive-app/react-canvas";

export const Explain: React.FC = () => {
  return (
    <div tw="w-full flex rounded-xl justify-between gap-4 items-center mt-[-1rem] mb-[-4rem] h-64">
      <ExplainItem
        title="Power tokens"
        description="Power tokens maintain constant leverage, through a novel mechanism of borrowing AMM shares."
      />
      <Rive src="rocket.riv" tw="w-52 h-full" />
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
