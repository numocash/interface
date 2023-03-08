import { useState } from "react";
import { styled } from "twin.macro";

import type { WrappedTokenInfo } from "../../hooks/useTokens2";

type Props = {
  token?: WrappedTokenInfo;
  size?: number;
  className?: string;
};

export const TokenIcon: React.FC<Props> = ({
  className,
  token,
  size = 28,
}: Props) => {
  const [invalid, setInvalid] = useState<boolean>(false);

  return (
    <Wrapper
      tw="flex rounded-[50%] overflow-hidden"
      className={className}
      size={size}
    >
      {invalid || !token?.logoURI ? (
        <Placeholder />
      ) : (
        <img
          src={token.logoURI}
          onError={() => {
            setInvalid(true);
          }}
          alt={`Icon for token ${token.name ?? ""}`}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div<{ size: number }>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
`;

const Placeholder = styled.div`
  height: 100%;
  width: 100%;
  border: 1px dashed #ccc;
  border-radius: 100%;
`;
