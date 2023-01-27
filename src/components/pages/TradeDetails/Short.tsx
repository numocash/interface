import { AssetSelection } from "../../common/AssetSelection";
import { Button } from "../../common/Button";
import { TokenIcon } from "../../common/TokenIcon";
import { useTradeDetails } from ".";
import { ShortStats } from "./ShortStats";

export const Short: React.FC = () => {
  const { other, denom } = useTradeDetails();

  return (
    <>
      <div tw="flex items-center gap-2 ">
        <p tw="text-sm">Buy</p>
        <div tw="flex items-center space-x-2 px-1 py-2 rounded-lg bg-gray-200">
          <TokenIcon size={16} token={other} />
          <div tw="mr-1 space-y-1">
            <div tw=" text-sm font-semibold  leading-none">{other.symbol}-</div>
          </div>
        </div>
      </div>
      <AssetSelection
        tw="border-2 border-gray-200 rounded-lg "
        label={<span>Pay</span>}
        // onSelect={(value) => onFieldSelect(Field.Input, value)}
        selectedValue={denom}
        // inputValue={typedValue}
        // inputOnChange={(value) => onFieldInput(Field.Input, value)}
        currentAmount={{
          amount: undefined,
          allowSelect: true,
        }}
      />
      <ShortStats />
      <Button variant="primary" tw="h-12 text-xl font-bold">
        Short {other.symbol}
      </Button>
    </>
  );
};
