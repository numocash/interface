import styled from "@emotion/styled";
import tw from "twin.macro";

import { ReactComponent as Numoen } from "./images/numoen-small.svg";

export const LoadingSpinner = styled(Numoen)`
  ${tw`duration-1000 transform animate-ping `}

  display: inline;
  height: 1em;
  width: 1em;
`;
