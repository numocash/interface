import React from "react";
import { Link, useLocation } from "react-router-dom";
import tw, { styled } from "twin.macro";

export const Nav: React.FC = () => {
  return (
    <div tw="fixed bottom-0 left-0 flex w-full items-center justify-center pl-0  xl:(justify-center pl-0) z-10 md:(absolute top-0 bottom-0)">
      <div tw="flex justify-center items-center   md:(rounded-xl w-auto h-auto) pb-4 pt-7 h-[70px] bg-white md:(border-none bg-opacity-0 p-0) p-1 w-full">
        <NavLink to="/trade">Trade</NavLink>
        <NavLink to="/positions">Positions</NavLink>
        <NavLink to="/earn">Earn</NavLink>
      </div>
    </div>
  );
};

const makeStyledLink = styled(Link);

const StyledNavLink = makeStyledLink(({ active }: { active?: boolean }) => [
  tw`relative px-3 text-2xl font-bold leading-5 text-secondary hover:text-default`,
  active && tw`text-default `,
  tw`border-transparent`,
]);

export const NavLink: React.FC<{
  children: React.ReactNode;
  to: string;
  activeRoutes?: string[];
}> = ({ children, to, activeRoutes = [to] }) => {
  const location = useLocation();
  const loc = location.pathname.split("/")[1] ?? "";
  const active =
    activeRoutes.filter((a) => loc === a.split("/")[1]?.toLowerCase()).length >
    0;
  return (
    <StyledNavLink active={active} to={to}>
      <span>{children}</span>
    </StyledNavLink>
  );
};
