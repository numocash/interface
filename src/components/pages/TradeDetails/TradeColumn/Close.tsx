import { useMemo, useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { useAccount } from "wagmi";

import { useBalance } from "../../../../hooks/useBalance";
import { useLendgine } from "../../../../hooks/useLendgine";
import {
  convertLiquidityToCollateral,
  convertPriceToLiquidityPrice,
  convertShareToLiquidity,
} from "../../../../utils/Numoen/lendgineMath";
import { numoenPrice } from "../../../../utils/Numoen/price";
import { scale } from "../../../../utils/Numoen/trade";
import { AssetSelection } from "../../../common/AssetSelection";
import { Button } from "../../../common/Button";
import { LoadingSpinner } from "../../../common/LoadingSpinner";
import { RowBetween } from "../../../common/RowBetween";
import { VerticalItem } from "../../../common/VerticalItem";
import { useTradeDetails } from "..";

export const Close: React.FC = () => {
  const { setClose, quote, selectedLendgine } = useTradeDetails();
  const { address } = useAccount();
  const symbol =
    quote.symbol + (selectedLendgine.token1.equals(quote) ? "+" : "-");

  const lendgineInfoQuery = useLendgine(selectedLendgine);

  const balanceQuery = useBalance(selectedLendgine.lendgine, address);

  // TODO: account for unaccrued interest
  const positionValue = useMemo(() => {
    if (
      !lendgineInfoQuery.data ||
      lendgineInfoQuery.isLoading ||
      !balanceQuery.data ||
      balanceQuery.isLoading
    )
      return null;

    const price = numoenPrice(selectedLendgine, lendgineInfoQuery.data);
    const liquidity = convertShareToLiquidity(
      balanceQuery.data,
      lendgineInfoQuery.data
    );
    const collateral = convertLiquidityToCollateral(
      liquidity,
      selectedLendgine
    );

    const liquidityPrice = convertPriceToLiquidityPrice(
      price,
      selectedLendgine
    );

    const liquidityValue = liquidity.multiply(liquidityPrice).divide(price);
    const collateralValue = collateral;

    const value = collateralValue.subtract(liquidityValue).divide(scale);
    return value;
  }, [
    balanceQuery.data,
    balanceQuery.isLoading,
    lendgineInfoQuery.data,
    lendgineInfoQuery.isLoading,
    selectedLendgine,
  ]);

  const [input, setInput] = useState("");
  return (
    <div tw="flex flex-col gap-2 w-full">
      <button onClick={() => setClose(false)} tw="items-center flex">
        <div tw="text-xs flex gap-1 items-center">
          <FaChevronLeft />
          Back
        </div>
      </button>
      <RowBetween tw="items-center p-0">
        <div tw="rounded-lg bg-gray-200 px-2 py-1 text-lg font-semibold">
          {symbol}
        </div>
        {positionValue ? (
          <VerticalItem
            label="position value"
            item={<p tw="mb-[-6px]">{positionValue.toSignificant(5)}</p>}
            tw="items-center"
          />
        ) : (
          <LoadingSpinner />
        )}
      </RowBetween>
      <AssetSelection
        tw="border-2 border-gray-200 rounded-lg "
        inputValue={input}
        selectedValue={selectedLendgine.token1}
        label={<span>Receive</span>}
        inputOnChange={(value) => setInput(value)}
      />
      <Button variant="primary" tw="h-12 text-xl font-bold items-center">
        Sell {symbol}
      </Button>
    </div>
  );
};
