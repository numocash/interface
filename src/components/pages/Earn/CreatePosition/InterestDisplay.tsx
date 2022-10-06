import { FaMinus, FaPlus } from "react-icons/fa";

import { tickToAPR } from "../../../../utils/tick";
import { Button } from "../../../common/Button";
import { useCreatePair } from ".";

export const InterestDisplay: React.FC = () => {
  const { tick, setTick } = useCreatePair();

  return (
    <div tw="flex flex-col w-full text-default items-center">
      <p tw="font-semibold text-lg flex">Interest Rate</p>
      <div tw="flex w-full justify-around items-center">
        <Button onClick={() => tick !== 1 && setTick(tick - 1)}>
          <FaMinus tw="text-default" />
        </Button>
        <p>{tickToAPR(tick).toFixed(2)}%</p>
        <Button onClick={() => setTick(tick + 1)}>
          <FaPlus tw="text-default" />
        </Button>
      </div>
    </div>
  );
};
