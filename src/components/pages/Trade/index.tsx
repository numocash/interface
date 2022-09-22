import { Swap } from "./Swap";
import { SwapStateProvider } from "./useSwapState";

export const Trade: React.FC = () => {
  return (
    <div tw="flex flex-col gap-4">
      {/* <Module
        tw="w-full flex max-w-lg flex-col gap-2"
        css={css`
          background-image: radial-gradient(
            100% 100% at 50% 10%,
            #35d07f 10%,
            #3488ec 100%
          );
        `}
      >
        <div tw="font-semibold text-lg text-default dark:text-default-d">
          New Interface 🫡
        </div>
        <span tw="text-default dark:text-default-d">
          To use the legacy interface visit{" "}
          <a
            tw="underline"
            target="_blank"
            href="https://www.legacy.mobius.money"
            rel="noreferrer"
          >
            legacy.mobius.money
          </a>
        </span>
      </Module> */}
      <SwapStateProvider>
        <Swap />
      </SwapStateProvider>
    </div>
  );
};
