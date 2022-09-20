import invariant from "tiny-invariant";

import { AsyncButton } from "../../common/AsyncButton";
import { CenterSwitch } from "../../common/CenterSwitch";
import { Modal } from "../../common/Modal";
import { ToastExitButton } from "../../common/Settings";
import { TokenIcon } from "../../common/TokenIcon";
import { Field, useSwapState } from "./useSwapState";

interface Props {
  onDismiss: () => void;
}

export const ConfirmModal: React.FC<Props> = ({ onDismiss }: Props) => {
  const { trade, handleTrade, onFieldInput } = useSwapState();
  invariant(trade);

  // const minimumOutput = useMemo(
  //   () =>
  //     trade.minimumOutput ??
  //     trade.output.multiply(new Fraction(1).subtract(trade.priceImpact)),
  //   [trade.output, trade.priceImpact, trade.minimumOutput]
  // );
  return (
    <Modal
      pinToTop={false}
      tw="w-auto rounded-2xl"
      isOpen={true}
      onDismiss={onDismiss}
    >
      <div tw=" w-full flex rounded-xl p-4 flex-col text-default dark:text-default-d">
        <div tw="flex justify-between items-center mb-4">
          <div tw="flex gap-2 items-center">
            <span tw="flex items-center gap-2">Confirm Swap</span>
          </div>
          <ToastExitButton onClick={onDismiss}>×</ToastExitButton>
        </div>

        <div tw="rounded-xl bg-action border border-action hover:(border-outline) dark:(bg-action-d border-action-d hover:border-outline-d) p-3 flex">
          <div tw="justify-between flex w-full">
            <div tw="text-2xl">
              {trade.input.toFixed(6, { groupSeparator: "," })}
            </div>

            <div tw="flex items-center space-x-2">
              <TokenIcon size={24} token={trade.input.token} />
              <div tw="mr-1 space-y-1">
                <div tw="text-xl leading-none">{trade.input.token.symbol}</div>
              </div>
            </div>
          </div>
        </div>

        <CenterSwitch icon="arrow" />
        <div tw="rounded-xl bg-action border border-action hover:(border-outline) dark:(bg-action-d border-action-d hover:border-outline-d) p-3 flex">
          <div tw="justify-between flex w-full">
            <div tw="text-2xl">
              {trade.output.toFixed(6, { groupSeparator: "," })}
            </div>

            <div tw="flex items-center space-x-2">
              <TokenIcon size={24} token={trade.output.token} />
              <div tw="mr-1 space-y-1">
                <div tw="text-xl leading-none">{trade.output.token.symbol}</div>
              </div>
            </div>
          </div>
        </div>

        <div tw="rounded-xl bg-action border border-action hover:(border-outline) dark:(bg-action-d border-action-d hover:border-outline-d) p-3 flex flex-col gap-2">
          {/* <div tw="flex w-full justify-between text-sm">
            <div>Minimum Output</div>
            <div>{minimumOutput.toFixed(6, { groupSeparator: "," })}</div>
          </div> */}
          {/* <div tw="flex w-full justify-between text-sm">
            <div>Price Impact</div>
            <div>{trade.priceImpact.toFixed(2)}%</div>
          </div> */}
        </div>

        <AsyncButton
          variant="primary"
          tw="h-12 text-xl mt-2"
          onClick={() => {
            handleTrade();
            onFieldInput(Field.Input, "");
            onFieldInput(Field.Output, "");

            onDismiss();
          }}
        >
          Confirm Swap
        </AsyncButton>
      </div>
    </Modal>
  );
};
