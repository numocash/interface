import { PercentageSlider } from "../../../common/inputs/PercentageSlider";
import { useManage } from ".";

export const Withdraw: React.FC = () => {
  const { withdrawPercent, setWithdrawPercent } = useManage();

  return (
    <PercentageSlider
      disabled={false}
      input={withdrawPercent}
      onChange={setWithdrawPercent}
    />
  );
};
