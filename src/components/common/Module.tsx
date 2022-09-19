import "twin.macro";

import { ErrorBoundary } from "react-error-boundary";

interface Props {
  className?: string;
  children?: React.ReactNode;
}

export const Module: React.FC<Props> = ({ children, className }: Props) => {
  return (
    <div
      tw="p-6 rounded border border-neutral-700 bg-gray-600 bg-opacity-80 w-full shadow-2xl max-w-[378px]"
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
