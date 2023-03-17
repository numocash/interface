import { Fraction } from "@uniswap/sdk-core";
import JSBI from "jsbi";

export const ONE_HUNDRED_PERCENT = new Fraction(1);

export const scale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18));
