import { Module } from "../../common/Module";

export const Notice: React.FC = () => {
  return (
    <Module tw="flex items-start gap-2 max-w-lg mb-3 border-0 bg-[#111214]">
      <div tw="flex flex-col gap-2">
        <p tw="font-bold text-2xl flex items-center gap-1 text-white">
          Numoen has leveraged tokens!
        </p>
        <div tw="ml-4">
          <p tw="text-white list-item">Always 2x leverage</p>
          <p tw="text-white list-item">No liquidations</p>
          <p tw="text-white list-item">No oracles</p>
        </div>
      </div>
    </Module>
  );
};
