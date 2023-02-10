import { useState } from "react";
import { FaDiscord } from "react-icons/fa";
import { ImBook, ImGithub, ImTwitter } from "react-icons/im";
import tw, { styled } from "twin.macro";

import { ReactComponent as MoreIcon } from "../../../icons/more-horizontal.svg";
import { Drop } from "../../common/Drop";
import { Module } from "../../common/Module";
import { HeaderItem } from "./Nav";

const size = 20;

export const MoreInfo: React.FC = () => {
  const [targetRef, setTargetRef] = useState<HTMLElement | null>(null);
  const [show, setShow] = useState(false);
  return (
    <>
      <Drop
        onDismiss={() => setShow(false)}
        show={show}
        target={targetRef}
        placement={"auto"}
      >
        <Module tw="p-1 border-2 border-gray-200">
          <a
            href="https://numoen.gitbook.io/numoen/"
            target="_blank"
            rel="noreferrer"
          >
            <InfoItem>
              <ImBook size={size} />
              Documentation
            </InfoItem>
          </a>
          <a
            href="https://discord.com/invite/6Dtc49Dt4W"
            target="_blank"
            rel="noreferrer"
          >
            <InfoItem>
              <FaDiscord size={size} />
              Discord
            </InfoItem>
          </a>
          <a href="https://github.com/Numoen" target="_blank" rel="noreferrer">
            <InfoItem>
              <ImGithub size={size} />
              Github
            </InfoItem>
          </a>
          <a href="https://twitter.com/numoen" target="_blank" rel="noreferrer">
            <InfoItem>
              <ImTwitter size={size} />
              Twitter
            </InfoItem>
          </a>
        </Module>
      </Drop>
      <button onClick={() => setShow(true)} ref={setTargetRef}>
        <HeaderItem item={<MoreIcon tw="h-6" />} label="More" />
      </button>
    </>
  );
};

const InfoItem = styled.div`
  ${tw`flex items-center gap-2 px-4 py-2 duration-300 ease-in-out transform rounded text-default hover:bg-gray-100`}
`;
