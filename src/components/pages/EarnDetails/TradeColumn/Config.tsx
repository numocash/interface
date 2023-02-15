import { getAddress } from "@ethersproject/address";

import { AddressLink } from "../../../../utils/beet";
import { RowBetween } from "../../../common/RowBetween";
import { useEarnDetails } from "..";

export const Config: React.FC = () => {
  const { base: denom, quote: other, lendgines } = useEarnDetails();

  return (
    <div tw="flex flex-col w-full">
      <RowBetween tw="items-center">
        <p tw="text-sm">Base token:</p>
        <AddressLink
          address={getAddress(denom.address)}
          tw="text-sm underline"
        />
      </RowBetween>
      <RowBetween tw="items-center">
        <p tw="text-sm">Speculative token:</p>
        <AddressLink
          address={getAddress(other.address)}
          tw="text-sm underline"
        />
      </RowBetween>

      <RowBetween tw="items-start">
        <p tw="text-sm">Lendgines:</p>

        <div tw="flex flex-col gap-4">
          {lendgines.map((l) => (
            <AddressLink
              key={l.address}
              address={l.address}
              tw="text-sm underline"
            />
          ))}
        </div>
      </RowBetween>
    </div>
  );
};
