interface Props {
  className?: string;
}

export const LoadingSpinner: React.FC<Props> = ({ className }: Props) => (
  <img
    className={className}
    src="/numoen.png"
    alt="Loading"
    tw="h-4 w-4 transform duration-1000 animate-ping opacity-20"
  />
);
