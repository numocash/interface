import tw, { styled } from "twin.macro";

export const Loading: React.FC = () => {
  return (
    <div tw="grid grid-cols-3 gap-4 w-full">
      {[...Array(20).keys()].map((i) => (
        <Item key={i} />
      ))}
    </div>
  );
};

const Item = styled.div(() => [
  tw`flex bg-gray-200 rounded-xl h-[180px] w-[288px] animate-pulse `,
]);
