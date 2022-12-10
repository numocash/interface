import type { Token } from "@dahlia-labs/token-utils";
import { BiLineChart, BiLineChartDown } from "react-icons/bi";
import invariant from "tiny-invariant";

import { useDisplayToken } from "../../hooks/useTokens";
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
  size = 14,
}: Props) => {
  const displayToken = useDisplayToken(token);
  invariant(displayToken);

  return chart === "up" ? (
    <div tw="flex items-center gap-1 p-1 py-0 rounded bg-green-200 border border-green-500 text-secondary font-semibold">
      <TokenIcon token={displayToken} size={size} />
      {text && <p tw="text-default text-xs">{displayToken.symbol}</p>}
      <BiLineChart size={size} tw="text-green-500" />
    </div>
  ) : (
    <div tw="flex items-center gap-1 p-1 py-0 rounded bg-red bg-opacity-30 border border-red text-secondary font-semibold">
      <TokenIcon token={displayToken} size={size} />
      {text && <p tw="text-default text-xs">{displayToken.symbol}</p>}
      <BiLineChartDown size={size} tw="text-red" />
    </div>
  );
};
