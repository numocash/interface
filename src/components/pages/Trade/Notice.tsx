import arbLogo from "../../common/images/arbitrum.svg";
import { Module } from "../../common/Module";

export const Notice: React.FC = () => {
  return (
    <Module tw="flex items-start gap-2 max-w-lg mb-3 border-0  bg-gradient-to-br from-blue to-amber-300 justify-center">
      <div tw="flex gap-4 items-center">
        <p tw="font-bold text-2xl flex items-center gap-1 text-white">
          Numoen is live!
        </p>
        <img src={arbLogo} alt="arbitrum" height={36} width={36} />

        {/* <div tw="ml-4">
          <p tw="text-white list-item">Always 2x leverage</p>
          <p tw="text-white list-item">No liquidations</p>
          <p tw="text-white list-item">No oracles</p>
        </div> */}
      </div>
    </Module>
  );
};
