import type { Token } from "@dahlia-labs/token-utils";
import { BiLineChart, BiLineChartDown } from "react-icons/bi";

import { TokenIcon } from "./TokenIcon";

interface Props {
  token: Token;
  chart: "up" | "down";
  size?: number;
}

export const ChartIcons: React.FC<Props> = ({
  token,
  chart,
  size = 16,
}: Props) => {
  return chart === "up" ? (
    <div tw="flex items-center gap-1 p-1 rounded bg-green-200 border-2 border-green-500 text-secondary font-semibold">
      <TokenIcon token={token} size={size} />
      <BiLineChart size={size} tw="text-green-500" />
    </div>
  ) : (
    <div tw="flex items-center gap-1 p-1 rounded bg-red-200 border-2 border-red-500 text-secondary font-semibold">
      <TokenIcon token={token} size={size} />
      <BiLineChartDown size={size} tw="text-red-500" />
    </div>
  );
};
