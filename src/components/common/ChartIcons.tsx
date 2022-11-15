import type { Token } from "@dahlia-labs/token-utils";
import { BiLineChart, BiLineChartDown } from "react-icons/bi";

import { TokenIcon } from "./TokenIcon";

interface Props {
  token: Token;
  chart: "up" | "down";
  size?: number;
  text?: boolean;
}

export const ChartIcons: React.FC<Props> = ({
  token,
  chart,
  text,
  size = 16,
}: Props) => {
  return chart === "up" ? (
    <div tw="flex items-center gap-1 p-1 rounded bg-green-200 border-2 border-green-500 text-secondary font-semibold">
      <TokenIcon token={token} size={size} />
      {text && <p tw="text-default text-sm">{token.symbol}</p>}
      <BiLineChart size={size} tw="text-green-500" />
    </div>
  ) : (
    <div tw="flex items-center gap-1 p-1 rounded bg-red bg-opacity-30 border-2 border-red text-secondary font-semibold">
      <TokenIcon token={token} size={size} />
      {text && <p tw="text-default text-sm">{token.symbol}</p>}
      <BiLineChartDown size={size} tw="text-red" />
    </div>
  );
};
