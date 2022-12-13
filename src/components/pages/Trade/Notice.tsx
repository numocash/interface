import power from "../../common/images/power.png";
import { Module } from "../../common/Module";

export const Notice: React.FC = () => {
  return (
    <Module tw="flex items-start gap-2 max-w-lg mb-3 border-0 bg-[#111214]">
      <div tw="flex flex-col gap-2">
        <p tw="font-bold text-2xl flex items-center gap-1 text-white">
          Numoen has squared options{" "}
          <span>
            <img tw="h-[45px] w-[59px]" src={power} alt={`power`} />
          </span>
        </p>
        <p tw="text-white">
          Compared to a 2x perp, you make more when prices go up and lose less
          when prices go down and can't be liquidated
        </p>
      </div>
    </Module>
  );
};
