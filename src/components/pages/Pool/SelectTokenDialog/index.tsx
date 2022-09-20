import type { Token } from "@dahlia-labs/token-utils";
import React from "react";

import { Modal } from "../../../common/Modal";
import { TokenSearch } from "./TokenSearch";

export enum TokenModalView {
  search,
}
interface SelectTokenDialogProps {
  tokens?: readonly Token[];
  isOpen: boolean;
  onDismiss: () => void;
  onSelect?: (value: Token) => void;
  onClose?: () => void;
  token?: Token;
  selectedToken?: Token;
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
        onDismiss={onDismiss}
      />
    </Modal>
  );
};

export default SelectTokenDialog;
