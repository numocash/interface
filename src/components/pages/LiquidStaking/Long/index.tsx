import { useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { useAccount } from "wagmi";

import { About } from "./About";
import { Burn } from "./Burn";
import { Mint } from "./Mint";
import { useEnvironment } from "../../../../contexts/useEnvironment";
import { useBalance } from "../../../../hooks/useBalance";
import { Button } from "../../../common/Button";
import { LoadingSpinner } from "../../../common/LoadingSpinner";
import { TokenAmountDisplay } from "../../../common/TokenAmountDisplay";
import { useLongValue } from "../useValue";

export const Long: React.FC = () => {
  const environment = useEnvironment();
  const { address } = useAccount();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lendgine = environment.interface.liquidStaking!.lendgine;

  const [close, setClose] = useState(false);
  const userBalanceQuery = useBalance(lendgine.lendgine, address);
  const positionValue = useLongValue(userBalanceQuery.data);

  return (
    <div tw="w-full max-w-5xl rounded bg-white  border border-[#dfdfdf] p-4 shadow flex flex-col gap-4 h-fit">
      <div tw="w-full justify-center flex">
        <div tw="bg-[#303030] items-center text-white w-36 flex justify-center py-2 rounded-xl relative  -top-9 font-semibold">
          Long
        </div>
      </div>

      {close ? (
        <>
          <button
            onClick={() => setClose(false)}
            tw="items-center flex mt-[-2rem]"
          >
            <div tw="text-xs flex gap-1 items-center">
              <FaChevronLeft />
              Back
            </div>
          </button>
          <Burn />
        </>
      ) : (
        <Mint />
      )}
      <div tw="flex flex-col gap-1 my-4">
        <div tw="w-full text-secondary items-center grid-cols-2 grid">
          <p tw="">Position value</p>
        </div>
        <div tw="border-b border-gray-200 w-full" />
        <div tw="w-full grid grid-cols-2 items-center h-12">
          {positionValue.value ? (
            <TokenAmountDisplay amount={positionValue.value} showSymbol />
          ) : (
            <LoadingSpinner />
          )}
          <Button
            variant="danger"
            tw="w-fit px-2 justify-self-end text-lg font-semibold"
            disabled={!positionValue.value || positionValue.value.equalTo(0)}
            onClick={() => {
              setClose(true);
            }}
          >
            Close
          </Button>
        </div>
      </div>
      <div tw="w-full border-gray-200 border-b" />
      <About />
    </div>
  );
};
