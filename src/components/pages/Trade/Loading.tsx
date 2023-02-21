export const Loading: React.FC = () => {
  return (
    <>
      {[...Array(20).keys()].map((i) => (
        <div key={i} tw="gap-2 flex flex-col">
          {i !== 0 && (
            <div tw="w-full flex justify-self-center border-b-2 border-gray-200" />
          )}
          <div tw="w-full h-14 duration-300 animate-pulse bg-gray-300 rounded-xl" />
        </div>
      ))}
    </>
  );
};
