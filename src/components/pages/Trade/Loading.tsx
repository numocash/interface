export const Loading: React.FC = () => {
  return (
    <>
      {[...Array(20).keys()].map((i) => (
        <div
          key={i}
          tw="w-full h-12 duration-300 animate-pulse bg-gray-300 rounded-xl"
        />
      ))}
    </>
  );
};
