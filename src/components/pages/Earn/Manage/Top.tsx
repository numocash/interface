// import { useMemo } from "react";
// import { FaChevronLeft } from "react-icons/fa";
// import { NavLink } from "react-router-dom";

// import { useLendgine } from "../../../../hooks/useLendgine";
// import { supplyRate } from "../../../../utils/Numoen/jumprate";
// import { TokenIcon } from "../../../common/TokenIcon";
// import { Stats } from "../PositionCard/Stats";
// import { useManage } from ".";

// export const Top: React.FC = () => {
//   const { market } = useManage();
//   const marketInfo = useLendgine(market);

//   const rate = useMemo(
//     () => (marketInfo ? supplyRate(marketInfo) : null),
//     [marketInfo]
//   );
//   return (
//     <>
//       <NavLink to={`/earn`} tw="flex items-center gap-2 text-default">
//         <FaChevronLeft />
//         <span tw="text-sm">Back to market list</span>
//       </NavLink>

//       <div tw="flex justify-between align-top pb-3">
//         <div tw="flex items-center gap-3">
//           <div tw="flex items-center space-x-[-0.5rem]">
//             <TokenIcon token={market.pair.speculativeToken} size={36} />
//             <TokenIcon token={market.pair.baseToken} size={36} />
//           </div>
//           <div tw="grid gap-0.5">
//             <span tw="font-semibold text-xl text-default leading-tight">
//               {market.pair.speculativeToken.symbol} /{" "}
//               {market.pair.baseToken.symbol}
//             </span>
//           </div>
//         </div>
//         <div tw="flex flex-col items-center text-center">
//           <p tw="text-default text-lg font-bold">
//             {rate ? rate.toFixed(1) : "--"}%
//           </p>
//           <p tw="text-sm text-secondary">APR</p>
//         </div>
//       </div>

//       <hr tw="border-[#AEAEB2] rounded " />
//       <Stats market={market} userInfo={null} />
//     </>
//   );
// };
