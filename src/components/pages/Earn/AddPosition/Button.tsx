import { Button } from "../../../common/Button";

export const ConfirmButton: React.FC = () => {
  return (
    <Button variant="primary" disabled={!!false} tw="max-w-md">
      {"Add"}
    </Button>
  );
};
