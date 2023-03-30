import { useCallback, useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import { useEnvironment } from "../../../../contexts/useEnvironment";
import { useBalance } from "../../../../hooks/useBalance";
import { useCurrentPrice } from "../../../../hooks/useExternalExchange";
import { useLendgine } from "../../../../hooks/useLendgine";
import { Beet } from "../../../../utils/beet";
import tryParseCurrencyAmount from "../../../../utils/tryParseCurrencyAmount";
import { AssetSelection } from "../../../common/AssetSelection";
import { AsyncButton } from "../../../common/AsyncButton";
import { CenterSwitch } from "../../../common/CenterSwitch";
import { useDeposit, useDepositAmounts } from "./useDeposit";

export const Deposit: React.FC = () => {
  const { address } = useAccount();
  const environment = useEnvironment();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lendgine = environment.interface.liquidStaking!.lendgine;
  const token0Balance = useBalance(lendgine.token0, address);
  const token1Balance = useBalance(lendgine.token1, address);
  const lendgineInfo = useLendgine(lendgine);
  const [token0Input, setToken0Input] = useState("");
  const [token1Input, setToken1Input] = useState("");
  const priceQuery = useCurrentPrice([
    lendgine.token0,
    lendgine.token1,
  ] as const);

  const { token0Input: token0Amount, token1Input: token1Amount } =
    useDepositAmounts({
      amount:
        tryParseCurrencyAmount(token0Input, lendgine.token0) ??
        tryParseCurrencyAmount(token1Input, lendgine.token1),
      price: priceQuery.data,
    });

  const deposit = useDeposit({
    token0Input: token0Amount,
    token1Input: token1Amount,
    price: priceQuery.data,
  });

  const onInput = useCallback(
    (value: string, field: "token0" | "token1") => {
      if (!lendgineInfo.data) {
        field === "token0" ? setToken0Input(value) : setToken1Input(value);
        return;
      }

      field === "token0" ? setToken0Input(value) : setToken1Input(value);
      field === "token0" ? setToken1Input("") : setToken0Input("");
    },
    [lendgineInfo.data]
  );

  const disableReason = useMemo(
    () =>
      lendgineInfo.isLoading
        ? "Loading"
        : // : lendgineInfo.data?.totalLiquidity.equalTo(0)
        // ? "No liquidity in pair"
        !token0Amount || !token1Amount
        ? "Enter an amount"
        : token0Balance.isLoading ||
          token1Balance.isLoading ||
          deposit.status !== "success"
        ? "Loading"
        : (token0Balance.data &&
            token0Amount.greaterThan(token0Balance.data)) ||
          (token1Balance.data && token1Amount.greaterThan(token1Balance.data))
        ? "Insufficient amount"
        : null,
    [
      lendgineInfo.isLoading,
      token0Amount,
      token1Amount,
      token0Balance.isLoading,
      token0Balance.data,
      token1Balance.isLoading,
      token1Balance.data,
      deposit.status,
    ]
  );

  return (
    <>
      <div tw="flex flex-col rounded-lg border border-gray-200 mt-[-2rem]">
        <AssetSelection
          tw="pb-2"
          label={<span>Input</span>}
          selectedValue={lendgine.token0}
          inputValue={
            token0Input === ""
              ? token0Amount?.toSignificant(5) ?? ""
              : token0Input
          }
          inputOnChange={(value) => {
            onInput(value, "token0");
          }}
          currentAmount={{
            amount: token0Balance.data,
            allowSelect: true,
          }}
        />
        <div tw=" border-b w-full border-gray-200" />
        <CenterSwitch icon="plus" />
        <AssetSelection
          label={<span>Input</span>}
          tw="pt-4"
          selectedValue={lendgine.token1}
          inputValue={
            token1Input === ""
              ? token1Amount?.toSignificant(5) ?? ""
              : token1Input
          }
          inputOnChange={(value) => {
            onInput(value, "token1");
          }}
          currentAmount={{
            amount: token1Balance.data,
            allowSelect: true,
          }}
        />
      </div>

      <AsyncButton
        variant="primary"
        disabled={!!disableReason}
        tw=" h-12 text-lg"
        onClick={async () => {
          invariant(deposit.data);
          await Beet(deposit.data);

          onInput("", "token0");
          onInput("", "token1");
        }}
      >
        {disableReason ?? "Add liquidity"}
      </AsyncButton>
    </>
  );
};
