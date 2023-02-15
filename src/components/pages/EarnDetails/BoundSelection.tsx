import { IoIosArrowDown } from "react-icons/io";

export const BoundSelection: React.FC = () => {
  return (
    <div tw="w-full justify-center flex mt-4">
      <div tw="flex items-center gap-6">
        <button tw="bg-gray-200 p-1 rounded-lg items-center justify-center">
          <IoIosArrowDown tw="rotate-90" />
        </button>

        <p tw="flex text-xl gap-1">
          Bound:<span tw="font-semibold"> 2x</span>
        </p>

        <button tw="bg-gray-200 p-1 rounded-lg items-center justify-center">
          <IoIosArrowDown tw="-rotate-90" />
        </button>
      </div>
    </div>
  );
};
