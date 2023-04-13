import { useMemo, useState } from "react";

import { useAccount } from "wagmi";

import { Stats } from "./Stats";
import { useEnvironment } from "../../../contexts/useEnvironment";
import { useMintAmount } from "../../../hooks/useAmounts";
import { useBalance } from "../../../hooks/useBalance";
import { useLendgine } from "../../../hooks/useLendgine";
import { useMint } from "../../../hooks/useMint";
import tryParseCurrencyAmount from "../../../utils/tryParseCurrencyAmount";
import { AssetSelection } from "../../common/AssetSelection";
import { AsyncButton } from "../../common/AsyncButton";
import { TokenIcon } from "../../common/TokenIcon";
import { PageMargin } from "../../layout";

export const LiquidStaking: React.FC = () => {
  const { address } = useAccount();
  const environment = useEnvironment();

  const staking = environment.interface.liquidStaking!;
  const [input, setInput] = useState("");

  const balanceQuery = useBalance(staking.lendgine.token1, address);

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(input, staking.lendgine.token1),
    [input, staking.lendgine.token1]
  );

  const lendgineInfoQuery = useLendgine(staking.lendgine);
  const mintAmounts = useMintAmount(staking.lendgine, parsedAmount, "stpmmp");
  const mint = useMint(staking.lendgine, parsedAmount, "stpmmp");

  const disableReason = useMemo(
    () =>
      input === ""
        ? "Enter an amount"
        : !parsedAmount
        ? "Invalid amount"
        : !balanceQuery.data
        ? "Loading"
        : parsedAmount.greaterThan(balanceQuery.data)
        ? "Insufficient balance"
        : mintAmounts.status !== "success" ||
          !lendgineInfoQuery.data ||
          !mint.data
        ? "Loading"
        : mintAmounts.liquidity.greaterThan(
            lendgineInfoQuery.data?.totalLiquidity
          )
        ? "Insufficient liqudity"
        : null,
    [
      balanceQuery.data,
      input,
      lendgineInfoQuery.data,
      mint.data,
      mintAmounts.liquidity,
      mintAmounts.status,
      parsedAmount,
    ]
  );
  return (
    <PageMargin tw="w-full pb-12 sm:pb-0 flex flex-col  gap-6 max-w-5xl">
      <div tw="w-full max-w-5xl rounded bg-white  border border-[#dfdfdf] pt-12 md:pt-20 px-6 pb-6 shadow mb-12">
        <div tw="flex flex-col lg:flex-row lg:justify-between gap-4 lg:items-center">
          <p tw="font-bold text-2xl sm:text-4xl">Liquid Staking Boost</p>
          <div tw="gap-2 grid">
            <p tw="sm:text-lg text-[#8f8f8f] max-w-md">
              Boost staking yields by speculating on staking rewards.
            </p>
          </div>
          {/* TODO: add details section */}
        </div>
      </div>
      <TokenIcon
        token={environment.interface.liquidStaking!.lendgine.token1}
        size={48}
      />
      <Stats />
      <div tw="flex border border-gray-200 rounded-xl overflow-hidden p-2 flex-col bg-white gap-6">
        <AssetSelection
          tw="p-2"
          label="Deposit"
          selectedValue={staking.lendgine.token1}
          inputValue={input}
          inputOnChange={setInput}
          currentAmount={{ allowSelect: true, amount: balanceQuery.data }}
        />

        <AsyncButton
          variant="primary"
          tw="h-12 text-xl font-bold items-center"
          disabled={!!disableReason}
          onClick={async () => {
            // invariant(mint.data);
            // await Beet(mint.data);

            setInput("");
          }}
        >
          {disableReason ?? "Trade"}
        </AsyncButton>
      </div>
    </PageMargin>
  );
};
