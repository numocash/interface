// import { Fraction } from "@dahlia-labs/token-utils";
// import { useMemo } from "react";

// import { useLendgine, usePrice } from "../../../../hooks/useLendgine";
// import { usePair } from "../../../../hooks/usePair";
// import { supplyRate } from "../../../../utils/Numoen/jumprate";
// import { sqrt } from "../../../../utils/Numoen/pairMath";
// import { pricePerLP } from "../../../../utils/Numoen/priceMath";
// import { LoadingSpinner } from "../../../common/LoadingSpinner";
// import { Module } from "../../../common/Module";
// import { RowBetween } from "../../../common/RowBetween";
// import { scale } from "../../TradeOld/useTrade";
// import { useManage } from ".";

// export const KeyStats: React.FC = () => {
//   const { market } = useManage();
//   const price = usePrice(market);
//   const marketInfo = useLendgine(market);
//   const pairInfo = usePair(market.pair);

//   const delta = useMemo(
//     () =>
//       price
//         ? market.pair.bound.asFraction
//             .subtract(price.asFraction)
//             .divide(market.pair.bound.asFraction)
//         : null,
//     [market.pair.bound.asFraction, price]
//   );

//   const impliedVol = useMemo(() => {
//     const pricePerLiquidity =
//       pairInfo && market ? pricePerLP(pairInfo, market?.pair) : null;

//     console.log(pricePerLiquidity?.asFraction.toFixed(4));

//     const rate = marketInfo ? supplyRate(marketInfo) : null;

//     const variance =
//       rate && pricePerLiquidity && price
//         ? rate.asFraction
//             .multiply(pricePerLiquidity)
//             .divide(price.asFraction.multiply(price.asFraction))
//         : null;

//     const vol = variance
//       ? new Fraction(sqrt(variance.multiply(scale).quotient), 10 ** 7)
//       : null;

//     return vol;
//   }, [market, marketInfo, pairInfo, price]);

//   const openInterest = useMemo(() => {
//     const pricePerLiquidity =
//       pairInfo && market ? pricePerLP(pairInfo, market?.pair) : null;

//     const openInterest =
//       pricePerLiquidity && marketInfo
//         ? pricePerLiquidity.asFraction.multiply(
//             marketInfo.totalLiquidityBorrowed
//           )
//         : null;
//     return openInterest;
//   }, [market, marketInfo, pairInfo]);
//   return (
//     <Module tw="text-default">
//       <p tw="font-bold text-default text-xl mb-4">Key Statistics</p>
//       <RowBetween tw="px-0 py-1">
//         <p tw="">Open interest</p>
//         <p tw="font-bold">
//           {openInterest ? (
//             openInterest.toSignificant(5, { groupSeparator: "," }) +
//             " " +
//             market.pair.baseToken.symbol
//           ) : (
//             <LoadingSpinner />
//           )}
//         </p>
//       </RowBetween>
//       <RowBetween tw="px-0 py-1">
//         <p tw="">Delta</p>
//         <p tw="font-bold">
//           {delta ? delta.toSignificant(3) : <LoadingSpinner />}
//         </p>
//       </RowBetween>
//       <RowBetween tw="px-0 py-1">
//         <p tw="">Gamma</p>
//         <p tw="font-bold">-2.00</p>
//       </RowBetween>
//       <RowBetween tw="px-0 py-1">
//         <p tw="">Implied vol.</p>
//         <p tw="font-bold">
//           {" "}
//           {impliedVol ? impliedVol.toSignificant(5) + "%" : <LoadingSpinner />}
//         </p>
//       </RowBetween>
//     </Module>
//   );
// };
