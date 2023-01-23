import React from "react";
import { FaMoneyBillWave } from "react-icons/fa";
import { RiScales3Line } from "react-icons/ri";
import { Link, useLocation } from "react-router-dom";
import tw, { styled } from "twin.macro";

export const Nav: React.FC = () => {
  return (
    <>
      <NavLink name="Trade" icon={<RiScales3Line size={24} />} to="/trade" />
      <NavLink name="Earn" icon={<FaMoneyBillWave size={24} />} to="/earn" />
    </>
  );
};

const NavLink: React.FC<{
  name: string;
  icon: React.ReactNode;
  to: string;
  activeRoutes?: string[];
}> = ({ name, icon, to, activeRoutes = [to] }) => {
  const location = useLocation();
  const loc = location.pathname.split("/")[1] ?? "";
  const active =
    activeRoutes.filter((a) => loc === a.split("/")[1]?.toLowerCase()).length >
    0;
  return (
    <Link to={to}>
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
    <ItemWrapper tw="text-default">
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
  ${tw`flex flex-col items-center gap-1 px-2 py-1 text-secondary hover:(rounded-lg bg-gray-200) transform duration-300 ease-in-out`}
`;
