import type { Token, TokenAmount } from "@dahlia-labs/token-utils";
import { partition } from "lodash";
import type { CSSProperties } from "react";
import React, { useCallback, useMemo, useRef } from "react";
import { useVirtual } from "react-virtual";

import { TokenItem } from "./TokenItem";

interface Props {
  results: readonly {
    token: Token;
    balance: TokenAmount;
    hasBalance: boolean;
  }[];
  selectedToken?: Token;
  onSelect?: (token: Token) => void;
}

export const TokenResults: React.FC<Props> = ({
  results,
  onSelect,
  selectedToken,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const sortedResults = useMemo(() => {
    const [hasBalance, hasNoBalance] = partition(results, (r) => r.hasBalance);
    return hasBalance.concat(hasNoBalance);
  }, [results]);

  const rowVirtualizer = useVirtual({
    paddingStart: 8,
    paddingEnd: 8,
    size: sortedResults.length,
    parentRef,
    estimateSize: useCallback(() => 56, []),
    overscan: 5,
  });

  const Row = useCallback(
    ({
      data,
      // index,
      style,
    }: {
      data:
        | {
            token: Token;
            balance: TokenAmount;
            hasBalance: boolean;
          }
        | undefined;
      index: number;
      style: CSSProperties;
    }) => {
      if (!data) return null;

      const { balance, token } = data;

      return (
        <TokenItem
          style={style}
          amount={balance}
          onClick={() => onSelect?.(token)}
          token={token}
          isSelected={selectedToken && token.equals(selectedToken)}
        />
      );
    },
    [onSelect, selectedToken]
  );

  return (
    <div tw="overflow-auto h-full w-full" ref={parentRef}>
      <div
        style={{
          height: `${rowVirtualizer.totalSize}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.virtualItems.map((virtualRow) => (
          <Row
            index={virtualRow.index}
            key={virtualRow.index}
            data={sortedResults[virtualRow.index]}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
