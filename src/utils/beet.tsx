import type { ContractTransaction } from "@ethersproject/contracts";
import React, { useCallback } from "react";
import toast from "react-hot-toast";
import invariant from "tiny-invariant";
import { styled } from "twin.macro";

import { useAwaitTX } from "../hooks/useAwaitTX";

export interface BeetTx {
  txEnvelope: () => Promise<ContractTransaction>;
  title: string;
  description: string;
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
  const awaitTX = useAwaitTX();
  return useCallback(
    async (actionTitle: string, stages: BeetStage[]) => {
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

      stages.length > 1 &&
        toaster.generalToast({
          type: "loading",
          id: `${random}-general`, // Don't use 0-1, because hot toast doesn't recompute height
          title: actionTitle,
          message: "Building...",
        });

      for (const [stageIndex, stage] of stages.entries()) {
        const previosTxs = [...Array(stageIndex).keys()].reduce(
          (acc, i) => acc + (stages[i]?.parallelTransactions.length ?? 0),
          0
        );

        const descriptions: Record<string, string> = {};

        for (const [index, bpTx] of stage.parallelTransactions.entries()) {
          descriptions[`TX#${1 + index}`] = bpTx.description;
        }
        let txs: ContractTransaction[] = [];

        const signPromptNotification = setTimeout(() => {
          // dismiss the general loading messages
          toaster.dismiss(`${random}-general`);
        }, 1000);

        toaster.dismiss(`${random}-${stageIndex - 1}-pre`);
        toaster.dismiss(`${random}-${stageIndex}-pre`);
        let start = 0;

        for (const [i, tx] of stage.parallelTransactions.entries()) {
          const humanCount = `${1 + i + previosTxs}/${totaltx}`;

          toaster.txLoading(
            _generateToasterId(stageIndex, i),
            tx.title,
            humanCount,
            tx.description
          );

          try {
            const contractTx = await tx.txEnvelope();
            start = Date.now();

            toaster.txLoading(
              _generateToasterId(stageIndex, i),
              tx.title,
              humanCount,
              tx.description,
              contractTx.hash
            );
            txs = txs.concat(contractTx);
          } catch (e) {
            interface Error {
              message: string;
            }
            console.error(e);
            const message =
              (e as Error).message ?? "Unknown error in transaction";

            toaster.txError(
              _generateToasterId(stageIndex, i),
              stage.stageTitle,
              humanCount,
              message
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
            duration: 30000,
          });
        }

        clearTimeout(signPromptNotification);

        for (const [i, tx] of txs.entries()) {
          const h = stage.parallelTransactions[i];
          const humanCount = `${1 + i + previosTxs}/${totaltx}`;

          invariant(h);
          try {
            const rec = await awaitTX(tx.hash);
            if (rec.status === 0) {
              clearTimeout(signPromptNotification);
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
              h.description,
              tx.hash
            );
          } catch (e) {
            clearTimeout(signPromptNotification);
            toaster.dismiss(`${random}-general`);
            const message = "Unknown error in transaction";

            toaster.txError(
              _generateToasterId(stageIndex, i),
              h.title,
              humanCount,
              message
            );
          }
        }

        clearTimeout(signPromptNotification);
      }
    },
    [awaitTX]
  );
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
      <ToastContainer tw="flex flex-col">
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
