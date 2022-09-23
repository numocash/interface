import type { Token } from "@dahlia-labs/token-utils";
import { TokenAmount } from "@dahlia-labs/token-utils";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import tw, { css, styled } from "twin.macro";

import useWindowDimensions from "../../utils/useWindowDimensions";
import SelectTokenDialog from "../pages/Trade/SelectTokenDialog";
import { BigNumericInput } from "./inputs/BigNumericInput";
import { TokenAmountDisplay } from "./TokenAmountDisplay";
import { TokenIcon } from "./TokenIcon";

const AssetSelectButton = styled.button(
  ({ noAsset }: { noAsset?: boolean }) => [
    tw`relative flex items-center justify-between flex-none px-2 text-left`,
    tw`text-base appearance-none cursor-pointer`,
    tw`h-10 whitespace-nowrap rounded-xl`,
    tw`text-default`,
    tw`hover:(bg-outline ) active:bg-outline shadow-none`,
    noAsset && tw`text-white bg-brand `,
  ]
);

const Accent = styled.span<{ onClick?: () => void }>`
  margin-left: 0.5em;

  ${({ onClick }) =>
    onClick !== undefined &&
    css`
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    `}
`;

const Balance = styled.div(tw`flex items-center`);

const Section = styled.div(tw`flex items-center justify-between`);

const DEFAULT_TOKEN_DECIMALS = 3;

interface Props {
  tokens?: readonly Token[];
  onSelect?: (token: Token) => void;
  selectedValue: Token | null;
  inputOnChange?: (val: string) => void;
  inputValue?: string;
  hideInput?: boolean;
  inputDisabled?: boolean;
  className?: string;
  label?: string | React.ReactNode;
  currentAmount?: {
    amount?: TokenAmount;
    allowSelect?: boolean;
    label?: string;
  };
}

export const AssetSelection: React.FC<Props> = ({
  label,
  onSelect,
  selectedValue,
  inputValue,
  inputDisabled = false,
  hideInput = false,
  inputOnChange,
  currentAmount,
}: Props) => {
  const { width } = useWindowDimensions();

  const uiDecimals =
    width < 600 ? 4 : selectedValue?.decimals ?? DEFAULT_TOKEN_DECIMALS;

  const token = selectedValue;

  const [show, setShow] = useState(false);

  return (
    <div
      css={[
        !hideInput &&
          tw`rounded-xl bg-action border border-action hover:(border-outline)`,
      ]}
    >
      <div
        css={[
          tw`flex items-center justify-between text-sm font-medium`,
          !hideInput && tw`px-4 pt-3`,
        ]}
      >
        <div tw="text-sm font-semibold text-default ">{label}</div>
        <div tw="pt-0 text-secondary font-normal">
          {selectedValue && (
            <Section>
              {currentAmount && !hideInput ? (
                <Balance>
                  <span>{currentAmount.label ?? "Balance"}:</span>
                  <Accent
                    onClick={
                      currentAmount.allowSelect && inputOnChange
                        ? () => {
                            if (
                              !currentAmount.amount ||
                              currentAmount.amount.equalTo("0")
                            ) {
                              inputOnChange("0");
                              return;
                            }
                            inputOnChange(currentAmount.amount.toExact());
                          }
                        : undefined
                    }
                  >
                    <TokenAmountDisplay
                      tw="text-default "
                      amount={
                        currentAmount.amount ??
                        new TokenAmount(selectedValue, 0)
                      }
                      locale="en-US"
                      numberFormatOptions={{
                        minimumFractionDigits: uiDecimals,
                        maximumFractionDigits: uiDecimals,
                      }}
                    />
                  </Accent>
                </Balance>
              ) : (
                <div />
              )}
            </Section>
          )}
        </div>
      </div>
      <div css={[!hideInput && tw`p-3 pl-4`]}>
        <div>
          <SelectTokenDialog
            tw="rounded-xl"
            isOpen={show}
            onDismiss={() => setShow(false)}
            selectedToken={selectedValue ?? undefined}
            onSelect={(token) => {
              onSelect?.(token);
              setShow?.(false);
            }}
          />
          <div tw={"flex relative py-0 rounded-xl"}>
            <div>
              <AssetSelectButton
                onClick={() => {
                  if (onSelect) {
                    setShow(true);
                  }
                }}
                noAsset={!token}
              >
                {token && (
                  <div tw="flex items-center space-x-2">
                    <TokenIcon size={24} token={token} />
                    <div tw="mr-1 space-y-1">
                      <div tw="text-xl font-semibold leading-none">
                        {token.symbol}
                      </div>
                    </div>
                  </div>
                )}
                {!token && (
                  <div tw={"flex p-1.5 space-x-2 items-center"}>
                    <div tw="text-lg font-semibold leading-none text-white">
                      Select a token
                    </div>
                  </div>
                )}
                {onSelect &&
                  (!token ? (
                    <div tw="text-sm flex items-center ml-2 text-white">
                      <FontAwesomeIcon fixedWidth icon={faChevronDown} />
                    </div>
                  ) : (
                    <div tw="text-sm flex items-center ml-2">
                      <FontAwesomeIcon fixedWidth icon={faChevronDown} />
                    </div>
                  ))}
              </AssetSelectButton>
            </div>
            {!hideInput && (
              <div tw="flex flex-grow flex-1">
                <BigNumericInput
                  tw="text-right text-default"
                  disabled={inputDisabled}
                  value={inputValue}
                  onChange={inputOnChange}
                  placeholder="0.0"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
