import { useParams } from "react-router-dom";
import invariant from "tiny-invariant";

export const Manage: React.FC = () => {
  const { lendgineAddress } = useParams<{
    lendgineAddress: string;
  }>();
  invariant(lendgineAddress, "pool address missing");
  // TODO: don't error when address is wrong
  return <p>hi</p>;
};
