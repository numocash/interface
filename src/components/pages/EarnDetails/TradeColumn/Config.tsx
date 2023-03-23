import { utils } from "ethers";

import { AddressLink } from "../../../../utils/beet";
import { RowBetween } from "../../../common/RowBetween";
import { useEarnDetails } from "../EarnDetailsInner";

export const Config: React.FC = () => {
  const { base: denom, quote: other, lendgines } = useEarnDetails();

  return (
    <div tw="w-full flex flex-col bg-white border rounded-xl border-gray-200 p-6 shadow gap-2 h-fit">
      <RowBetween tw="items-center p-0">
        <p tw=" text-secondary">Base token</p>
        <AddressLink
          data="address"
          address={utils.getAddress(denom.address)}
          tw=" underline"
        />
      </RowBetween>
      <RowBetween tw="items-center p-0">
        <p tw=" text-secondary">Speculative token</p>
        <AddressLink
          data="address"
          address={utils.getAddress(other.address)}
          tw="underline"
        />
      </RowBetween>

      <RowBetween tw="items-start p-0">
        <p tw=" text-secondary">Lendgines</p>

        <div tw="flex flex-col gap-4">
          {lendgines.map((l) => (
            <AddressLink
              data="address"
              key={l.address}
              address={l.address}
              tw="underline"
            />
          ))}
        </div>
      </RowBetween>
    </div>
  );
};
