import { getAddress } from "@ethersproject/address";

import { AddressLink } from "../../../../utils/beet";
import { RowBetween } from "../../../common/RowBetween";
import { useEarnDetails } from "../EarnDetailsInner";

export const Config: React.FC = () => {
  const { base: denom, quote: other, lendgines } = useEarnDetails();

  return (
    <div tw="flex flex-col w-full">
      <RowBetween tw="items-center">
        <p tw="text-sm text-secondary">Base token:</p>
        <AddressLink
          data="address"
          address={getAddress(denom.address)}
          tw="text-sm underline"
        />
      </RowBetween>
      <RowBetween tw="items-center">
        <p tw="text-sm text-secondary">Speculative token:</p>
        <AddressLink
          data="address"
          address={getAddress(other.address)}
          tw="text-sm underline"
        />
      </RowBetween>

      <RowBetween tw="items-start">
        <p tw="text-sm text-secondary">Lendgines:</p>

        <div tw="flex flex-col gap-4">
          {lendgines.map((l) => (
            <AddressLink
              data="address"
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
