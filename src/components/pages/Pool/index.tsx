import { NavLink } from "react-router-dom";

import { Button } from "../../common/Button";
import { EmptyPosition } from "./EmptyPosition";

export const Pool: React.FC = () => {
  return (
    <div tw="w-full max-w-2xl flex flex-col gap-2">
      <div tw="flex justify-between w-full">
        <p tw="text-default font-semibold text-2xl">Your Positions</p>
        <NavLink to="/pool/create-position">
          <Button variant="primary">New Position</Button>
        </NavLink>
      </div>
      <EmptyPosition />
    </div>
  );
};
