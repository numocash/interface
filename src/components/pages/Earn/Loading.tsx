import tw, { styled } from "twin.macro";

export const Loading: React.FC = () => {
  return (
    <>
      {[...Array(10).keys()].map((i) => (
        <Item key={i} />
      ))}
    </>
  );
};

const Item = styled.div(() => [
  tw` rounded-xl bg-gray-100 transform ease-in-out hover:scale-110 duration-300 flex py-2 px-4 gap-4 flex-col  h-[180px] w-full animate-pulse `,
]);
