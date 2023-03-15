import { isLongLendgine } from "../../../../utils/lendgines";
import { X } from "../../../common/Filter";
import { Modal } from "../../../common/Modal";
import { Buy } from "./TradeColumn/Buy";
import { Close } from "./TradeColumn/Close";
import { Returns } from "./TradeColumn/Returns";
import { useTradeDetails } from "./TradeDetailsInner";

export const TradeModal: React.FC = () => {
  const {
    modalOpen,
    setModalOpen,
    close,
    setClose,
    selectedLendgine,
    base,
    quote,
  } = useTradeDetails();

  const isLong = isLongLendgine(selectedLendgine, base);
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
          <div tw="font-semibold text-lg">
            {close ? "Sell" : "Buy"} {quote.symbol}
            {isLong ? "+" : "-"}
          </div>
          <X
            onClick={() => {
              setModalOpen(false);
              setClose(false);
            }}
          />
        </div>
        {close ? <Close modal={true} /> : <Buy />}
        {!close && (
          <>
            <div tw="w-full border-b-2 border-stroke" />
            <Returns />
          </>
        )}
      </div>
    </Modal>
  );
};
