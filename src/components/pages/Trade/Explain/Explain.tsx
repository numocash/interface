import Rive from "@rive-app/react-canvas";

import { PageMargin } from "../../../layout";

export const Explain: React.FC = () => {
  return (
    <PageMargin>
      <div tw="w-full flex rounded-xl justify-between gap-4 items-center mt-[-1rem] mb-[-3rem] h-64 max-w-3xl">
        <ExplainItem
          title="Power tokens"
          description="Power tokens maintain constant leverage, through a novel mechanism of borrowing AMM shares."
        />
        <Rive src="rocket.riv" tw="w-64 h-64" />
      </div>
    </PageMargin>
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
