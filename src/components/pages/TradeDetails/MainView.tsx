import { TokenIcon } from "../../common/TokenIcon";
import { Chart } from "./Chart/Chart";
import { TimeSelector } from "./Chart/TimeSelector";
import { TradeColumn } from "./TradeColumn/TradeColumn";
import { useTradeDetails } from "./TradeDetailsInner";

export const MainView: React.FC = () => {
  const { base, quote, setSelectedLendgine, setModalOpen } = useTradeDetails();

  // const { longLendgine, shortLendgine } = useNextLendgines();

  // const Buttons = (
  //   <div tw="gap-2 items-center xl:hidden hidden sm:flex ">
  //     {[longLendgine, shortLendgine].map((s) => {
  //       if (!s) return null;
  //       const isLong = isLongLendgine(s, base);

  //       return (
  //         <div key={s.address}>
  //           <Button
  //             variant="primary"
  //             tw="h-8 text-xl font-semibold"
  //             onClick={() => {
  //               setSelectedLendgine(s);
  //               setModalOpen(true);
  //             }}
  //           >
  //             {isLong ? "Long" : "Short"}
  //           </Button>
  //         </div>
  //       );
  //     })}
  //   </div>
  // );
  return (
    <>
      <div tw="col-span-2 w-full flex flex-col gap-2 bg-white border rounded border-[#dfdfdf] p-6 shadow">
        {/* <TradeModal /> */}

        <div tw="flex items-center gap-3 ">
          <div tw="flex items-center space-x-[-0.5rem]">
            <TokenIcon token={quote} size={32} />
            <TokenIcon token={base} size={32} />
          </div>
          <p tw="text-2xl font-bold">
            {quote.symbol} / {base.symbol}
          </p>
        </div>
        {/* {Buttons} */}
        <Chart />
        <TimeSelector />
        {/* <div tw="border-b-2 border-stroke" />
        <History />
        <Positions /> */}
      </div>

      <TradeColumn tw="" />
    </>
  );
};
