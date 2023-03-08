import { useState } from "react";

import { X } from "../../common/Filter";
import { Modal } from "../../common/Modal";

export const New: React.FC = () => {
  const [show, setShow] = useState(false);

  return (
    <>
      <Modal onDismiss={() => setShow(false)} isOpen={show}>
        <div tw="px-6 py-3 rounded-lg w-full bg-background flex flex-col gap-6">
          <div tw="flex justify-between">
            <p tw="font-semibold text-lg">Introduction Numoen 1.0</p>
            <X onClick={() => setShow(false)} />
          </div>
          <p>
            We are excited to announce the full version of the underlying
            protocol that powers Numoen
          </p>
          <p>
            Please migrate your funds from the beta version by withdrawing
            directly from the legacy site:
            <a href="legacy.numoen.com" target="_blank" tw="underline">
              {" "}
              here
            </a>
          </p>

          <p tw="text-lg font-semibold text-highlight">Happy trading!</p>
        </div>
      </Modal>

      <button onClick={() => setShow(true)}>
        <div tw="rounded-lg px-4 py-2 bg-gradient-to-tr from-button to-tertiary text-lg font-semibold text-white hidden sm:flex">
          Version 1.0
        </div>
        <div tw="rounded-lg px-2 py-1 bg-gradient-to-tr from-button to-tertiary text-lg font-semibold text-white sm:hidden">
          1.0
        </div>
      </button>
    </>
  );
};
