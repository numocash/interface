import tw, { styled } from "twin.macro";

export const Loading: React.FC = () => {
  return (
    <>
      {[...Array(20).keys()].map((i) => (
        <div key={i} tw="gap-2 flex flex-col w-full">
          {i !== 0 && <Divider />}
          <div tw="w-full h-14 duration-300 animate-pulse bg-secondary rounded-xl" />
        </div>
      ))}
    </>
  );
};

export const Divider = styled.div(() => [
  tw`flex mx-6 border-b border-gray-200`,
]);
