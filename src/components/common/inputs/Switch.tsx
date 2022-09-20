import React from "react";
import tw, { styled } from "twin.macro";

interface Props {
  selected: boolean;
  onSelect: (on: boolean) => void;
}

export const Switch: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <div tw="flex rounded-3xl p-1 justify-between items-center bg-container border-2 border-outline dark:(bg-container-d border-outline-d)">
      <SwitchButton
        onClick={() => onSelect(false)}
        active={!selected}
        selected={false}
      />
      <SwitchButton
        onClick={() => onSelect(true)}
        active={selected}
        selected={true}
      />
    </div>
  );
};

const SwitchButton = styled.button<{ active: boolean; selected: boolean }>(
  ({ active, selected }) => [
    tw`flex-1 p-3 font-semibold transition rounded-xl`,
    active && !selected && tw`bg-outline dark:bg-outline-d`,
    active && selected && tw`bg-primary`,
  ]
);
