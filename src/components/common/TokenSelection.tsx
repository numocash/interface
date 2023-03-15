import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

import type { WrappedTokenInfo } from "../../lib/types/wrappedTokenInfo";
import { AssetSelectButton } from "./AssetSelection";
import SelectTokenDialog from "./SelectTokenDialog";
import { TokenIcon } from "./TokenIcon";

interface Props {
  selectedToken?: WrappedTokenInfo;
  onSelect: (val: WrappedTokenInfo) => void;
  tokens?: readonly WrappedTokenInfo[];
}

export const TokenSelection: React.FC<Props> = ({
  selectedToken,
  onSelect,
  tokens,
}: Props) => {
  const [show, setShow] = useState(false);
  return (
    <>
      <SelectTokenDialog
        tw="rounded-xl w-full"
        isOpen={show}
        onDismiss={() => setShow(false)}
        selectedToken={selectedToken}
        onSelect={(token) => {
          onSelect(token);
          setShow(false);
        }}
        tokens={tokens}
      />
      <div tw={"flex relative py-0 rounded-xl"}>
        <div>
          <AssetSelectButton
            onClick={() => {
              setShow(true);
            }}
            noAsset={!selectedToken}
          >
            {!selectedToken ? (
              <div tw={"flex p-1.5 space-x-2 items-center"}>
                <div tw="text-lg font-semibold leading-none text-white">
                  Select a token
                </div>
              </div>
            ) : (
              <div tw="flex items-center space-x-2">
                <TokenIcon size={24} token={selectedToken} />
                <div tw="mr-1 space-y-1">
                  <div tw="text-xl font-semibold leading-none">
                    {selectedToken.symbol}
                  </div>
                </div>
              </div>
            )}
            {!selectedToken ? (
              <div tw="text-sm flex items-center ml-2 text-white">
                <FontAwesomeIcon fixedWidth icon={faChevronDown} />
              </div>
            ) : null}
          </AssetSelectButton>
        </div>
      </div>
    </>
  );
};
