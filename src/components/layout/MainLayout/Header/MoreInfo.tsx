import { AiOutlineMenu } from "react-icons/ai";

import { HeaderItem } from "./Nav";

export const MoreInfo: React.FC = () => {
  return <HeaderItem item={<AiOutlineMenu size={24} />} label="More" />;
};
