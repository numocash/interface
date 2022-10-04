export const InterestRate: React.FC = () => {
  return (
    <div tw="rounded-xl overflow-hidden bg-white shadow-2xl flex w-full flex-col">
      <div tw="px-6 h-[98px] flex py-3  flex-col justify-between bg-[#EDEEEF]">
        <>
          <p tw="text-xl font-semibold text-black">Select an interest rate</p>
          <p tw="text-default">
            This is the rate you agree to lend out your liquidity. Unutilized
            liquidity earns nothing.
          </p>
        </>
      </div>
      <p tw="text-default p-3 ">Fuck you, you chose 36.5% APR</p>
    </div>
  );
};
