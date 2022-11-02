import type { Token } from "@dahlia-labs/token-utils";
import { BiLineChart, BiLineChartDown } from "react-icons/bi";

import { TokenIcon } from "./TokenIcon";

interface Props {
  token: Token;
  chart: "up" | "down";
}

export const ChartIcons: React.FC<Props> = ({ token, chart }: Props) => {
  return chart === "up" ? (
    <div tw="flex items-center gap-2 px-2 py-1 rounded-lg bg-green-200 border-2 border-green-500 text-secondary font-semibold">
      <TokenIcon token={token} size={22} />
      {token.symbol}
      <BiLineChart size={22} tw="text-green-500" />
    </div>
  ) : (
    <div tw="flex items-center gap-2 px-2 py-1 rounded-lg bg-red-200 border-2 border-red-500 text-secondary font-semibold">
      <TokenIcon token={token} size={22} />

      {token.symbol}

      <BiLineChartDown size={22} tw="text-red-500" />
    </div>
  );
};
