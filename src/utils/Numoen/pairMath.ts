import type { IMarket } from "@dahlia-labs/numoen-utils";
import { TokenAmount } from "@dahlia-labs/token-utils";
import JSBI from "jsbi";

import { scale } from "../../components/pages/Trade/useTrade";
import { add1, scaleFactor, sub1 } from "./invariantMath";

export const getBaseOut = (
  amountSIn: TokenAmount,
  r1: TokenAmount,
  liquidity: TokenAmount,
  market: IMarket
): TokenAmount => {
  const ub = market.pair.bound.asFraction.multiply(scale).quotient;

  const i = JSBI.divide(
    JSBI.multiply(
      JSBI.divide(JSBI.multiply(amountSIn.raw, scale.quotient), liquidity.raw),
      scale.quotient
    ),
    scaleFactor(market.pair.speculativeScaleFactor)
  );

  const p1 = JSBI.divide(
    JSBI.multiply(
      JSBI.divide(JSBI.multiply(r1.raw, scale.quotient), liquidity.raw),
      scale.quotient
    ),
    scaleFactor(market.pair.speculativeScaleFactor)
  );

  const a = JSBI.divide(JSBI.multiply(i, ub), scale.quotient);
  const b = JSBI.divide(
    JSBI.divide(
      JSBI.add(
        JSBI.multiply(JSBI.multiply(p1, i), JSBI.BigInt(2)),
        JSBI.multiply(i, i)
      ),
      scale.quotient
    ),
    JSBI.BigInt(4)
  );

  return new TokenAmount(
    market.pair.baseToken,
    JSBI.divide(
      JSBI.divide(
        JSBI.multiply(
          liquidity.raw,
          JSBI.multiply(
            scaleFactor(market.pair.baseScaleFactor),
            JSBI.subtract(a, b)
          )
        ),
        scale.quotient
      ),
      scale.quotient
    )
  );
};

export const getBaseIn = (
  amountSOut: TokenAmount,
  r1: TokenAmount,
  liquidity: TokenAmount,
  market: IMarket
): TokenAmount => {
  const ub = market.pair.bound.asFraction.multiply(scale).quotient;

  const p1 = JSBI.divide(
    JSBI.multiply(
      JSBI.divide(JSBI.multiply(r1.raw, scale.quotient), liquidity.raw),
      scale.quotient
    ),
    scaleFactor(market.pair.speculativeScaleFactor)
  );

  const o = JSBI.divide(
    JSBI.multiply(
      JSBI.divide(JSBI.multiply(amountSOut.raw, scale.quotient), liquidity.raw),
      scale.quotient
    ),
    scaleFactor(market.pair.speculativeScaleFactor)
  );

  const a = JSBI.divide(
    JSBI.divide(
      JSBI.subtract(
        JSBI.multiply(o, o),
        JSBI.multiply(JSBI.multiply(o, p1), JSBI.BigInt(2))
      ),
      scale.quotient
    ),
    JSBI.BigInt(4)
  );
  const b = JSBI.divide(JSBI.multiply(o, ub), scale.quotient);

  return add1(
    new TokenAmount(
      market.pair.baseToken,
      JSBI.divide(
        JSBI.divide(
          JSBI.multiply(
            liquidity.raw,
            JSBI.multiply(
              scaleFactor(market.pair.baseScaleFactor),
              JSBI.add(a, b)
            )
          ),
          scale.quotient
        ),
        scale.quotient
      )
    )
  );
};

export const getSpeculativeOut = (
  amountBIn: TokenAmount,
  r1: TokenAmount,
  liquidity: TokenAmount,
  market: IMarket
): TokenAmount => {
  const ub = market.pair.bound.asFraction.multiply(scale).quotient;

  const p1 = JSBI.divide(
    JSBI.multiply(
      JSBI.divide(JSBI.multiply(r1.raw, scale.quotient), liquidity.raw),
      scale.quotient
    ),
    scaleFactor(market.pair.speculativeScaleFactor)
  );

  const i = JSBI.divide(
    JSBI.multiply(
      JSBI.divide(JSBI.multiply(amountBIn.raw, scale.quotient), liquidity.raw),
      scale.quotient
    ),
    scaleFactor(market.pair.baseScaleFactor)
  );

  const a = JSBI.subtract(JSBI.multiply(JSBI.BigInt(2), ub), p1);

  const b = sqrt(
    JSBI.add(
      JSBI.multiply(JSBI.multiply(JSBI.BigInt(4), scale.quotient), i),
      JSBI.multiply(a, a)
    )
  );

  const c = JSBI.subtract(b, a);

  return sub1(
    new TokenAmount(
      market.pair.speculativeToken,
      JSBI.divide(
        JSBI.divide(
          JSBI.multiply(
            liquidity.raw,
            JSBI.multiply(scaleFactor(market.pair.speculativeScaleFactor), c)
          ),
          scale.quotient
        ),
        scale.quotient
      )
    )
  );
};

export const getSpeculativeIn = (
  amountBOut: TokenAmount,
  r1: TokenAmount,
  liquidity: TokenAmount,
  market: IMarket
): TokenAmount => {
  const ub = market.pair.bound.asFraction.multiply(scale).quotient;

  const p1 = JSBI.divide(
    JSBI.multiply(
      JSBI.divide(JSBI.multiply(r1.raw, scale.quotient), liquidity.raw),
      scale.quotient
    ),
    scaleFactor(market.pair.speculativeScaleFactor)
  );

  const o = JSBI.divide(
    JSBI.multiply(
      JSBI.divide(JSBI.multiply(amountBOut.raw, scale.quotient), liquidity.raw),
      scale.quotient
    ),
    scaleFactor(market.pair.baseScaleFactor)
  );

  const a = JSBI.subtract(JSBI.multiply(JSBI.BigInt(2), ub), p1);
  const b = JSBI.subtract(
    JSBI.multiply(a, a),
    JSBI.multiply(JSBI.multiply(JSBI.BigInt(4), scale.quotient), o)
  );
  const c = JSBI.subtract(a, sqrt(b));

  return add1(
    new TokenAmount(
      market.pair.speculativeToken,
      JSBI.divide(
        JSBI.divide(
          JSBI.multiply(
            liquidity.raw,
            JSBI.multiply(scaleFactor(market.pair.speculativeScaleFactor), c)
          ),
          scale.quotient
        ),
        scale.quotient
      )
    )
  );
};

//   // babylonian method (https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Babylonian_method)
//   function sqrt(uint y) internal pure returns (uint z) {
//     if (y > 3) {
//         z = y;
//         uint x = y / 2 + 1;
//         while (x < z) {
//             z = x;
//             x = (y / x + x) / 2;
//         }
//     } else if (y != 0) {
//         z = 1;
//     }
// }

export const sqrt = (y: JSBI): JSBI => {
  let z = JSBI.BigInt(0);
  if (JSBI.greaterThan(y, JSBI.BigInt(3))) {
    z = y;
    let x = JSBI.add(JSBI.divide(y, JSBI.BigInt(2)), JSBI.BigInt(1));
    while (JSBI.lessThan(x, z)) {
      z = x;
      x = JSBI.divide(JSBI.add(JSBI.divide(y, x), x), JSBI.BigInt(2));
    }
  } else if (JSBI.NE(y, JSBI.BigInt(0))) {
    z = JSBI.BigInt(1);
  }
  return z;
};
