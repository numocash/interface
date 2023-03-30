import { useMemo, useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { useEnvironment } from "../../../../contexts/useEnvironment";
import { useLendgine } from "../../../../hooks/useLendgine";
import { useLendginePosition } from "../../../../hooks/useLendginePosition";
import { getT } from "../../../../lib/lendgineMath";
import { Beet } from "../../../../utils/beet";
import { AsyncButton } from "../../../common/AsyncButton";
import { Button } from "../../../common/Button";
import { TokenAmountDisplay } from "../../../common/TokenAmountDisplay";
import { useLPValue } from "../useValue";
import { About } from "./About";
import { Deposit } from "./Deposit";
import { accruedLendgineInfo, accruedLendginePositionInfo } from "./math";
import { useCollect } from "./useCollect";
import { Withdraw } from "./Withdraw";

export const LP: React.FC = () => {
  const { address } = useAccount();
  const environment = useEnvironment();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lendgine = environment.interface.liquidStaking!.lendgine;
  const t = getT();

  const [close, setClose] = useState(false);

  const lendgineInfoQuery = useLendgine(lendgine);
  const userPositionQuery = useLendginePosition(
    lendgine,
    address,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    environment.interface.liquidStaking!.base.liquidityManager
  );
  const positionValue = useLPValue(userPositionQuery.data);

  const collect = useCollect({
    lendgineInfo: lendgineInfoQuery.data,
    position: userPositionQuery.data,
  });

  const updatedPosition = useMemo(() => {
    if (!userPositionQuery.data || !lendgineInfoQuery.data) return undefined;
    const updatedLendgineInfo = accruedLendgineInfo(
      lendgine,
      lendgineInfoQuery.data,
      t
    );
    return accruedLendginePositionInfo(
      updatedLendgineInfo,
      userPositionQuery.data
    );
  }, [lendgine, lendgineInfoQuery.data, t, userPositionQuery.data]);

  return (
    <div tw="w-full max-w-5xl rounded bg-white  border border-[#dfdfdf] p-4 shadow flex flex-col gap-4 h-fit">
      <div tw="w-full justify-center flex">
        <div tw="bg-[#303030] items-center text-white w-36 flex justify-center py-2 rounded-xl relative  -top-9 font-semibold">
          Provide Liquidity
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
          <Withdraw />
        </>
      ) : (
        <Deposit />
      )}

      <div tw="flex flex-col">
        <div tw="w-full text-secondary items-center grid-cols-2 sm:grid-cols-3 grid">
          <p tw=" justify-self-start">Value</p>
          <p tw="justify-self-start hidden sm:flex">Interest</p>
        </div>
        <div tw="border-b border-gray-200 w-full" />
        <div tw="w-full grid grid-cols-2 sm:grid-cols-3 items-center py-3">
          {positionValue.value ? (
            <TokenAmountDisplay
              amount={positionValue.value}
              showSymbol
              tw=" w-full "
            />
          ) : (
            <div tw="w-14 sm:w-20 h-6 rounded-lg bg-gray-100 " />
          )}
          {updatedPosition?.tokensOwed ? (
            <TokenAmountDisplay
              tw=" w-full hidden sm:flex"
              amount={updatedPosition.tokensOwed}
              showIcon
              showSymbol
            />
          ) : (
            <div tw="w-14 sm:w-20 h-6 rounded-lg  bg-gray-100 " />
          )}
          <div tw="grid grid-cols-2 gap-2  w-full justify-self-end">
            <AsyncButton
              variant="primary"
              tw="sm:(text-lg font-semibold) py-0.5"
              disabled={
                !updatedPosition || updatedPosition.tokensOwed.equalTo(0)
              }
              onClick={async () => {
                invariant(collect.data);
                await Beet(collect.data);
              }}
            >
              Collect
            </AsyncButton>
            <Button
              variant="danger"
              tw="sm:(text-lg font-semibold) py-0.5"
              onClick={() => {
                setClose(true);
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
      <div tw="w-full border-gray-200 border-b my-4" />
      <About />
    </div>
  );
};
