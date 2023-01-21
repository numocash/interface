import { useState } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { FaDiscord } from "react-icons/fa";
import { ImBook, ImGithub, ImTwitter } from "react-icons/im";
import tw, { styled } from "twin.macro";

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
        <Module tw="p-1">
          <InfoItem>
            <ImBook size={size} />
            <a
              href="https://numoen.gitbook.io/numoen/"
              target="_blank"
              rel="noreferrer"
            >
              Documentation
            </a>
          </InfoItem>
          <InfoItem>
            <FaDiscord size={size} />
            <a
              href="https://discord.com/invite/6Dtc49Dt4W"
              target="_blank"
              rel="noreferrer"
            >
              Discord
            </a>
          </InfoItem>
          <InfoItem>
            <ImGithub size={size} />
            <a
              href="https://github.com/Numoen"
              target="_blank"
              rel="noreferrer"
            >
              Github
            </a>
          </InfoItem>
          <InfoItem>
            <ImTwitter size={size} />
            <a
              href="https://twitter.com/numoen"
              target="_blank"
              rel="noreferrer"
            >
              Twitter
            </a>
          </InfoItem>
        </Module>
      </Drop>
      <button onClick={() => setShow(true)} ref={setTargetRef}>
        <HeaderItem item={<AiOutlineMenu size={24} />} label="More" />
      </button>
    </>
  );
};

const InfoItem = styled.div`
  ${tw`flex items-center gap-2 px-4 py-2 rounded text-default hover:bg-gray-100`}
`;
