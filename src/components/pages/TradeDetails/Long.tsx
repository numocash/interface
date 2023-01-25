import { Token } from "@dahlia-labs/token-utils";

import { AssetSelection } from "../../common/AssetSelection";
import { Button } from "../../common/Button";
import { CenterSwitch } from "../../common/CenterSwitch";
import { useTradeDetails } from ".";
import { LongStats } from "./LongStats";

export const Long: React.FC = () => {
  const { other } = useTradeDetails();

  return (
    <>
      <div tw="rounded-lg border-2 border-blue">
        <AssetSelection
          tw=""
          label={<span>From</span>}
          // onSelect={(value) => onFieldSelect(Field.Input, value)}
          selectedValue={other}
          // inputValue={typedValue}
          // inputOnChange={(value) => onFieldInput(Field.Input, value)}
          currentAmount={{
            amount: undefined,
            allowSelect: true,
          }}
        />
        <div tw="border-blue border-b-2 w-full" />
        <CenterSwitch icon="arrow" />
        <AssetSelection
          label={<span>To</span>}
          // onSelect={(value) => onFieldSelect(Field.Input, value)}
          // TODO: set address to the lendgine address
          selectedValue={
            new Token({ ...other.info, symbol: `${other.symbol}+` })
          }
          // inputValue={typedValue}
          // inputOnChange={(value) => onFieldInput(Field.Input, value)}
          currentAmount={{
            amount: undefined,
            allowSelect: true,
          }}
        />
      </div>
      <LongStats />
      <Button variant="primary" tw="h-12 text-xl font-bold">
        Long {other.symbol}
      </Button>
    </>
  );
};
