import { objectKeys } from "ts-extras";
import tw, { css } from "twin.macro";

type Props<T extends string> = {
  tabs: { [key in T]: string };
  selectedTab: T;
  setSelectedTab: (val: T) => void;
};

export const TabSelection = <T extends string>({
  tabs,
  selectedTab,
  setSelectedTab,
}: Props<T>) => {
  return (
    <div tw="w-full justify-start flex">
      <div tw="flex text-lg justify-end p-0.5 items-center rounded-xl bg-gray-100">
        {objectKeys(tabs).map((t) => {
          return (
            <div key={tabs[t as T]}>
              <button
                css={css`
                  ${tw`grid px-2 py-1 font-semibold text-gray-500 border border-transparent rounded-xl justify-items-center`}
                  ${tw`hover:(text-gray-700) transform duration-300 ease-in-out`}
                ${t === selectedTab &&
                  tw`text-black bg-white rounded-[10px] border-gray-300/50`}
                `}
                onClick={() => {
                  setSelectedTab(t as T);
                }}
              >
                <span>{tabs[t as T]}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
