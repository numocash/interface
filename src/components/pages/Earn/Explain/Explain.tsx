import { useRive } from "@rive-app/react-canvas";

import { PageMargin } from "../../../layout";

export const Explain: React.FC = () => {
  const rive = useRive({
    src: "safe.riv",
    autoplay: true,
    animations: ["Example"],
  });
  return (
    <PageMargin>
      <div tw="w-full flex rounded-xl justify-between items-center mt-[-1rem] mb-[-4rem] h-64 max-w-3xl">
        <ExplainItem
          title="Provide liquidity"
          description="Provide liquidity to an automated market maker and earn interest from lending out your position."
        />
        <rive.RiveComponent tw="w-64 h-64" />
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
  <div tw="flex flex-col gap-2 min-w-[7rem]">
    <p tw="text-2xl font-semibold text-highlight">{title}</p>
    <p tw="text-paragraph">{description}</p>
  </div>
);
