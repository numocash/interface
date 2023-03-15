import React from "react";

import type { WrappedTokenInfo } from "../../../lib/types/wrappedTokenInfo";
import { Modal } from "../Modal";
import { TokenSearch } from "./TokenSearch";

export enum TokenModalView {
  search,
}
interface SelectTokenDialogProps {
  tokens?: readonly WrappedTokenInfo[];
  isOpen: boolean;
  onDismiss: () => void;
  onSelect?: (value: WrappedTokenInfo) => void;
  selectedToken?: WrappedTokenInfo;
}

const SelectTokenDialog: React.FC<SelectTokenDialogProps> = ({
  tokens,
  isOpen,
  onDismiss,
  onSelect,
  selectedToken,
}) => {
  return (
    <Modal tw="rounded-xl" isOpen={isOpen} onDismiss={onDismiss}>
      <TokenSearch
        selectedToken={selectedToken}
        tokens={tokens}
        isOpen={isOpen}
        onSelect={onSelect}
      />
    </Modal>
  );
};

export default SelectTokenDialog;
