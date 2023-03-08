import { X } from "../../common/Filter";
import { Modal } from "../../common/Modal";
import { useEarnDetails } from "./EarnDetailsInner";
import { Deposit } from "./TradeColumn/Deposit";
import { Withdraw } from "./TradeColumn/Withdraw";

export const TradeModal: React.FC = () => {
  const { modalOpen, setModalOpen, close, setClose } = useEarnDetails();

  return (
    <Modal
      isOpen={modalOpen}
      onDismiss={() => {
        setModalOpen(false);
        setClose(false);
      }}
      tw=""
    >
      <div tw="px-6 py-3 rounded-lg w-full bg-background flex flex-col gap-4">
        <div tw="flex justify-between items-center">
          <div tw="font-semibold text-lg">{close ? "Withdraw" : "Deposit"}</div>
          <X
            onClick={() => {
              setModalOpen(false);
              setClose(false);
            }}
          />
        </div>
        {close ? <Withdraw modal={true} /> : <Deposit />}
      </div>
    </Modal>
  );
};
