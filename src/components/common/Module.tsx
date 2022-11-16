import "twin.macro";

import { ErrorBoundary } from "react-error-boundary";

interface Props {
  className?: string;
  children?: React.ReactNode;
}

export const Module: React.FC<Props> = ({ children, className }: Props) => {
  return (
    <div
      tw="p-6 rounded-lg border border-gray-400 bg-white  w-full shadow-2xl"
      className={className}
    >
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
