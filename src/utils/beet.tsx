import type { SendTransactionResult } from "@wagmi/core";
import { waitForTransaction } from "@wagmi/core";
import React, { useCallback } from "react";
import toast from "react-hot-toast";
import invariant from "tiny-invariant";
import { styled } from "twin.macro";
import type { Address, useContractWrite, usePrepareContractWrite } from "wagmi";

// import { useAwaitTX } from "../hooks/useAwaitTx";

export interface BeetTx {
  tx: {
    prepare: ReturnType<typeof usePrepareContractWrite>;
    send: ReturnType<typeof useContractWrite>;
  };
  title: string;
}

export interface BeetStage {
  stageTitle: string;
  parallelTransactions: BeetTx[];
}

const genRanHex = (size: number) => {
  const chars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < size; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

export const useBeet = () => {
  // const awaitTX = useAwaitTX();
  return useCallback(async (stages: BeetStage[]) => {
    const toaster = new DefaultToasterWrapper();

    const random = genRanHex(12); // to prevent toast collisions

    function _generateToasterId(stageIndex: number, localTxIndex: number) {
      console.log(`${random}-${stageIndex}-${localTxIndex}`);
      return `${random}-${stageIndex}-${localTxIndex}`;
    }

    const totaltx = stages.reduce(
      (acc, cur) => acc + cur.parallelTransactions.length,
      0
    );

    // TODO: do we need this?
    // stages.length > 1 &&
    //   toaster.generalToast({
    //     type: "loading",
    //     id: `${random}-general`, // Don't use 0-1, because hot toast doesn't recompute height
    //     title: actionTitle,
    //     message: "Building...",
    //   });

    for (const [stageIndex, stage] of stages.entries()) {
      const previousTxs = [...Array(stageIndex).keys()].reduce(
        (acc, i) => acc + (stages[i]?.parallelTransactions.length ?? 0),
        0
      );
      if (stageIndex === 0) {
        // First stage should be settled
        // For now assume that first stage is settled, later create promise for this
        stage.parallelTransactions.forEach((t, i) => {
          if (t.tx.prepare.isIdle || t.tx.prepare.isLoading) {
            toaster.txError(
              _generateToasterId(stageIndex, i),
              stage.stageTitle,
              `${1 + i + previousTxs}/${totaltx}`,
              "Gas estimation not finished on first stage"
            );
            return;
          }
        });
      } else {
        // other stages should be refetched
        await Promise.all(
          stage.parallelTransactions.map((t) => t.tx.prepare.refetch())
        );
      }

      // Error if any errors are present
      for (const [index, bpTx] of stage.parallelTransactions.entries()) {
        if (
          !bpTx.tx.send.writeAsync ||
          !!bpTx.tx.prepare.error ||
          !!bpTx.tx.send.error
        ) {
          const humanCount = `${1 + index + previousTxs}/${totaltx}`;

          toaster.dismiss(`${random}-${stageIndex}-pre`);

          toaster.txError(
            _generateToasterId(stageIndex, index),
            stage.stageTitle,
            humanCount,
            "Error with transaction"
          );
          return;
        }

        // if (stageIndex === 0)
        //   invariant(
        //     bpTx.tx.send.sendTransactionAsync,
        //     "Transaction not ready to send"
        //   );
      }

      // once all transactions are estimated and not error, send transaction function can be assumed to be defined

      let txs: SendTransactionResult[] = [];

      // const signPromptNotification = setTimeout(() => {
      //   // dismiss the general loading messages
      //   toaster.dismiss(`${random}-general`);
      // }, 1000);

      // dismiss previous toast
      toaster.dismiss(`${random}-${stageIndex}-pre`);
      let start = 0;

      for (const [i, tx] of stage.parallelTransactions.entries()) {
        const humanCount = `${1 + i + previousTxs}/${totaltx}`;

        toaster.txLoading(
          _generateToasterId(stageIndex, i),
          tx.title,
          humanCount,
          "Approve in wallet"
        );

        // send the transaction
        invariant(tx.tx.send.writeAsync, "send transaction");
        try {
          const contractTx = await tx.tx.send.writeAsync();
          start = Date.now();

          toaster.txLoading(
            _generateToasterId(stageIndex, i),
            tx.title,
            humanCount,
            "",
            contractTx.hash
          );
          txs = txs.concat(contractTx);
        } catch (err) {
          console.log(typeof err, err);
          toaster.txError(
            _generateToasterId(stageIndex, i),
            tx.title,
            humanCount,
            "Error sending transaction"
          );
          return;
        }
      }

      const nextStage = stages[stageIndex + 1];
      if (nextStage) {
        toaster.generalToast({
          type: "loading",
          id: `${random}-${stageIndex + 1}-pre`,
          title: nextStage.stageTitle,
          message: `Waiting for previous transaction${
            stage.parallelTransactions.length ? "s" : ""
          }...`,
          duration: 30_000,
        });
      }

      // clearTimeout(signPromptNotification);

      for (const [i, tx] of txs.entries()) {
        const h = stage.parallelTransactions[i];
        const humanCount = `${1 + i + previousTxs}/${totaltx}`;

        invariant(h);
        // wait for transactions to return
        // const rec = await tx.wait(); // TODO: why can't we use web sockets
        const rec = await waitForTransaction({ hash: tx.hash });
        // const rec = await awaitTX(tx.hash); // TODO: could just wait for the first out the two
        if (rec.status === 0) {
          // clearTimeout(signPromptNotification);
          toaster.dismiss(`${random}-general`);
          toaster.txError(
            _generateToasterId(stageIndex, i),
            h.title,
            humanCount,
            "Transaction reverted",
            rec.transactionHash
          );
          return;
        }
        console.log((Date.now() - start) / 1000);
        toaster.txSuccess(
          _generateToasterId(stageIndex, i),
          h.title,
          humanCount,
          "",
          tx.hash
        );
      }

      // clearTimeout(signPromptNotification);
    }
  }, []);
};

type GeneralToastArgs = {
  type: "loading" | "success" | "error";
  id: string;
  title: string;
  message: string | JSX.Element | React.ReactNode;
  humanCount?: string;
  duration?: number;
};

export class DefaultToasterWrapper {
  // style = tw`p-4 rounded-xl min-w-[300px]`;

  txLoading(
    id: string,
    title: string,
    humanCount: string,
    txDescription: string,
    txHash?: string
  ): void {
    toast.loading(
      this._buildToastContainer(
        title,
        humanCount,
        () => {
          toast.dismiss(id);
        },
        txDescription,
        txHash
      ),
      {
        id,
        duration: 10000,
        position: "bottom-left",
      }
    );
    return;
  }
  txError(
    // TODO: These fucntions can be combined into 1 just like generalToast
    id: string,
    title: string,
    humanCount: string,
    message: string,
    txHash?: string
  ): void {
    toast.error(
      this._buildToastContainer(
        title,
        humanCount,
        () => {
          toast.dismiss(id);
        },
        message,
        txHash
      ),
      {
        id,
        duration: 6000,
        position: "bottom-left",
      }
    );
    return;
  }
  txSuccess(
    id: string,
    title: string,
    humanCount: string,
    txDescription: string,
    txHash: string
  ): void {
    toast.success(
      this._buildToastContainer(
        title,
        humanCount,
        () => {
          toast.dismiss(id);
        },
        txDescription,
        txHash
      ),
      {
        id,
        duration: 3000,
        position: "bottom-left",
      }
    );
    return;
  }

  dismiss(id: string): void {
    toast.dismiss(id);
  }

  generalToast({
    type,
    id,
    title,
    message,
    duration,
    humanCount,
  }: GeneralToastArgs): void {
    if (!duration) {
      duration = 7000;
    }
    console.log(id, title, message);
    const toastHandler = toast[type];
    toastHandler(
      <ToastContainer tw="flex flex-col overflow-hidden">
        <div tw="flex font-semibold justify-between items-center">
          <span tw="flex items-center gap-1">
            {title}
            {humanCount && (
              <span tw="flex text-sm text-secondary">({humanCount})</span>
            )}
          </span>
          <ToastExitButton onClick={() => toast.dismiss(id)}>×</ToastExitButton>
        </div>

        <div tw="flex text-secondary">
          <div>{message}</div>
        </div>
      </ToastContainer>,
      {
        id,
        duration,
        position: "bottom-left",
      }
    );
    return;
  }

  private _buildToastContainer(
    title: string,
    humanCount: string,
    dismiss: () => void,
    txDescription?: string,
    hash?: string
  ) {
    return (
      <ToastContainer tw="flex flex-col overflow-hidden">
        <div tw="flex font-semibold justify-between items-center">
          <span tw="flex items-center gap-1">
            {title}
            <span tw="flex text-sm text-secondary">({humanCount})</span>
          </span>
          <ToastExitButton onClick={dismiss}>×</ToastExitButton>
        </div>

        <div tw="flex text-secondary">
          {hash ? (
            <div>
              View Transaction: {/* TODO: update the explorer based on chain */}
              <a
                href={`https://arbiscan.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {hash.slice(0, 6)}...{hash.slice(hash.length - 4)}
              </a>
            </div>
          ) : (
            <div>{txDescription}</div>
          )}
        </div>
      </ToastContainer>
    );
  }
}

export const AddressLink: React.FC<{
  address: Address;
  className?: string;
}> = ({ address, className }) => (
  <a
    href={`https://arbiscan.io/address/${address}`}
    rel="noopener noreferrer"
    target="_blank"
    className={className}
  >
    {address.slice(0, 6)}...{address.slice(address.length - 4)}
  </a>
);

const ToastContainer = styled.div`
  width: 290px;
`;

const ToastExitButton = styled.span`
  font-size: 20px;
  cursor: pointer;
  color: #888d9b;

  &:hover {
    color: #000;
  }
`;
