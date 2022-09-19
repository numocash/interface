import type { Network } from "@dahlia-labs/celo-contrib";
import styled from "@emotion/styled";
import React from "react";
import ReactDOMServer from "react-dom/server";
import type { ToastPosition } from "react-hot-toast";
import { toast } from "react-hot-toast";

interface INotifyArgs {
  message?: string;
  description?: React.ReactNode;
  txid?: string;
  txids?: string[];
  env?: Network;
  type?: "success" | "error" | "info" | "warn";
  placement?: ToastPosition;
}

export function notify({
  message,
  description,
  txid,
  txids,
  env,
  type = "info",
  placement = "bottom-left",
}: INotifyArgs): void {
  const logLevel =
    type === "warn" ? "warn" : type === "error" ? "error" : "info";
  console[logLevel](
    `Notify: ${message ?? "<no message>"} -- ${
      typeof description === "string"
        ? description
        : ReactDOMServer.renderToStaticMarkup(<>{description}</>)
    }`,
    {
      env,
      txid,
      txids,
      type,
    }
  );

  if (txids?.length === 1) {
    txid = txids[0];
  }
  if (txid) {
    description = (
      <div>
        View Transaction:{" "}
        <a
          href={`https://explorer.solana.com/tx/${txid}?cluster=${
            env?.toString() ?? ""
          }`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {txid.slice(0, 8)}...{txid.slice(txid.length - 8)}
        </a>
      </div>
    );
  } else if (txids) {
    description = (
      <div>
        View Transactions:{" "}
        <TxContainer>
          {txids.map((txid, i) => (
            <a
              key={i}
              href={`https://explorer.solana.com/tx/${txid}?cluster=${
                env?.toString() ?? ""
              }`}
              target="_blank"
              rel="noopener noreferrer"
            >
              [{i + 1}]
            </a>
          ))}
        </TxContainer>
      </div>
    );
  }

  toast(
    <div tw="flex flex-col gap-1">
      <span tw="font-semibold">{message}</span>
      <span tw="text-secondary">{description}</span>
    </div>,
    {
      position: placement,
    }
  );
}

const TxContainer = styled.div`
  display: inline-flex;
  gap: 4px;
`;
