import React from "react";
import toast from "react-hot-toast";
import { styled } from "twin.macro";
import type { Address } from "wagmi";
import { useNetwork } from "wagmi";

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
              View Transaction:
              <AddressLink address={hash} data="tx" />
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
  address: Address | string;
  data: "tx" | "address";
  className?: string;
}> = ({ address, className, data }) => {
  const { chain } = useNetwork();
  return (
    <a
      href={`${
        chain?.blockExplorers?.default.url ?? "https://arbiscan.io"
      }/${data}/${address}`}
      rel="noopener noreferrer"
      target="_blank"
      className={className}
      tw="underline"
    >
      {address.slice(0, 6)}...{address.slice(address.length - 4)}
    </a>
  );
};

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
