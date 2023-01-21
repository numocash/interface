export const Loading: React.FC = () => {
  return (
    <div tw="flex flex-col max-w-2xl gap-2 w-full">
      {[...Array(20).keys()].map((i) => (
        <div
          key={i}
          tw="w-full h-12 duration-300 animate-pulse bg-gray-300 rounded-xl"
        />
      ))}
    </div>
  );
};
