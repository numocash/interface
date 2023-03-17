import { isLongLendgine } from "../../../lib/lendgines";
import { Button } from "../../common/Button";
import { TokenIcon } from "../../common/TokenIcon";
import { Chart } from "./Chart/Chart";
import { TimeSelector } from "./Chart/TimeSelector";
import { History } from "./History/History";
import { Positions } from "./History/Positions/Positions";
import { useNextLendgines, useTradeDetails } from "./TradeDetailsInner";
import { TradeModal } from "./TradeModal";

export const MainView: React.FC = () => {
  const { base, quote, setSelectedLendgine, setModalOpen } = useTradeDetails();

  const { longLendgine, shortLendgine } = useNextLendgines();

  const Buttons = (
    <div tw="gap-2 items-center xl:hidden hidden sm:flex ">
      {[longLendgine, shortLendgine].map((s) => {
        if (!s) return null;
        const isLong = isLongLendgine(s, base);

        return (
          <div key={s.address}>
            <Button
              variant="primary"
              tw="h-8 text-xl font-semibold"
              onClick={() => {
                setSelectedLendgine(s);
                setModalOpen(true);
              }}
            >
              {isLong ? "Long" : "Short"}
            </Button>
          </div>
        );
      })}
    </div>
  );
  return (
    <>
      <div tw="col-span-2 w-full flex mt-2 flex-col gap-4 transform ease-in-out duration-300 max-w-3xl justify-self-center">
        <TradeModal />

        <div tw="flex w-full justify-between items-center">
          <div tw="flex flex-col gap-2">
            <div tw="flex items-center gap-3 ">
              <div tw="flex items-center space-x-[-0.5rem] rounded-lg px-2 py-1 bg-secondary">
                <TokenIcon token={quote} size={32} />
                <TokenIcon token={base} size={32} />
              </div>
              <div tw="flex gap-1 font-semibold text-lg text-paragraph ">
                <p tw="border-b-2 border-b-green">{quote.symbol}</p>
                <p>/</p>
                <p tw="border-b-2 border-b-red">{base.symbol}</p>
              </div>
            </div>
          </div>
          {Buttons}
        </div>
        <Chart />
        <TimeSelector />
        <div tw="border-b-2 border-stroke" />
        <History />
        <Positions />
      </div>
    </>
  );
};
