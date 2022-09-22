import { Module } from "../../common/Module";

export const EmptyPosition: React.FC = () => {
  return (
    <Module tw="w-full max-w-2xl flex justify-center">
      <p tw="text-default">You have no positions</p>
    </Module>
  );
};
