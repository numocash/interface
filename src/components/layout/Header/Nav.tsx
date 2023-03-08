import React from "react";
import { Link, useLocation } from "react-router-dom";
import tw, { styled } from "twin.macro";

import { ReactComponent as EarnIcon } from "../../../icons/banknote.svg";
import { ReactComponent as TradeIcon } from "../../../icons/coins.svg";

interface Props {
  className?: string;
}

export const Nav: React.FC<Props> = ({ className }: Props) => {
  return (
    <>
      <NavLink
        name="Trade"
        icon={<TradeIcon tw="h-6" />}
        to="/trade"
        className={className}
      />
      <NavLink
        name="Earn"
        icon={<EarnIcon tw="h-6" />}
        to="/earn"
        className={className}
      />
    </>
  );
};

const NavLink: React.FC<{
  name: string;
  icon: React.ReactNode;
  to: string;
  activeRoutes?: string[];
  className?: string;
}> = ({ name, icon, to, activeRoutes = [to], className }) => {
  const location = useLocation();
  const loc = location.pathname.split("/")[1] ?? "";
  const active =
    activeRoutes.filter((a) => loc === a.split("/")[1]?.toLowerCase()).length >
    0;
  return (
    <Link to={to} className={className}>
      <HeaderItem active={active} item={icon} label={name} />
    </Link>
  );
};

interface HeaderItemProps {
  active?: boolean;
  item: React.ReactNode;
  label: string;
}

export const HeaderItem: React.FC<HeaderItemProps> = ({
  active,
  item,
  label,
}: HeaderItemProps) => {
  return active ? (
    <ItemWrapper tw="text-headline">
      {item}
      <p tw="text-[12px]">{label}</p>
    </ItemWrapper>
  ) : (
    <ItemWrapper>
      {item}
      <p tw="text-[12px]">{label}</p>
    </ItemWrapper>
  );
};

const ItemWrapper = styled.div`
  ${tw`flex flex-col items-center gap-1 px-2 py-1 text-secondary rounded-lg hover:(scale-110 text-headline) transform duration-300 ease-in-out`}
`;
