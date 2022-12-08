import "twin.macro";

import { ErrorBoundary } from "react-error-boundary";

interface Props {
  className?: string;
  children?: React.ReactNode;
}

export const SubModule: React.FC<Props> = ({ children, className }: Props) => {
  return (
    <div tw="p-3  bg-white w-full flex flex-col" className={className}>
      <ErrorBoundary
        fallback={
          <p tw="text-red">An error occurred while loading this component.</p>
        }
      >
        {children}
      </ErrorBoundary>
    </div>
  );
};
