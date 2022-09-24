import "twin.macro";

import { ErrorBoundary } from "react-error-boundary";

interface Props {
  className?: string;
  children?: React.ReactNode;
}

export const SubModule: React.FC<Props> = ({ children, className }: Props) => {
  return (
    <div
      tw="p-3 rounded-3xl bg-white w-full max-w-lg flex flex-col"
      className={className}
    >
      <ErrorBoundary
        fallback={
          <p tw="text-red-500">
            An error occurred while loading this component.
          </p>
        }
      >
        {children}
      </ErrorBoundary>
    </div>
  );
};
