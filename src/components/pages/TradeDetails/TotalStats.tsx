import { Module } from "../../common/Module";
import { RowBetween } from "../../common/RowBetween";

export const TotalStats: React.FC = () => {
  return (
    <Module>
      <RowBetween>
        <p>Open Interest</p>
        <p>--</p>
      </RowBetween>
      <RowBetween>
        <p>Volume</p>
        <p>--</p>
      </RowBetween>
    </Module>
  );
};
