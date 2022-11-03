import styled from "@emotion/styled";
import React, { useState } from "react";
import tw from "twin.macro";

import { handleException } from "../../utils/error";
import { LoadingSpinner } from "./LoadingSpinner";

type Variant =
  | "outline"
  | "default"
  | "danger"
  | "primary"
  | "secondary"
  | "notice"
  | "cool"
  | "muted"
  | "gray"
  | "primary-inverse";

type Size =
  | "sm"
  | "small"
  | "md"
  | "medium"
  | "lg"
  | "large"
  | "swap"
  | undefined;

interface AdditionalButtonProps {
  size?: Size;
  variant?: Variant;
  icon?: boolean;
}

export interface ButtonProps
  extends React.DetailedHTMLProps<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >,
    AdditionalButtonProps {
  onClick?:
    | ((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void)
    | ((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => Promise<void>);
  children?: React.ReactNode;
}

/**
 * A button.
 * @returns
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  disabled,
  className,
  onClick,
  ...props
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <StyledButton
      {...props}
      onClick={
        onClick
          ? async (e) => {
              setLoading(true);
              try {
                await onClick(e);
              } catch (e) {
                handleException(e, {
                  source: "button",
                });
              }
              setLoading(false);
            }
          : undefined
      }
      disabled={disabled || loading}
      className={className}
      style={{
        ...props.style,
      }}
    >
      {loading ? (
        <div tw="flex items-center gap-2">
          {children}
          <LoadingSpinner tw="ml-2 mb-0.5" />
        </div>
      ) : (
        children
      )}
    </StyledButton>
  );
};

export const StyledButton = styled.button<AdditionalButtonProps>(
  ({ size = "sm", variant = "default", icon }) => [
    tw`flex flex-row items-center justify-center leading-normal`,
    tw`rounded-lg`,
    tw`text-sm font-semibold`,
    tw`text-white transform active:scale-98 hover:bg-opacity-90`,
    tw`transition-transform`,

    variant === "outline" &&
      tw`text-white border border-brand hover:border-white`,
    variant === "primary" && tw`text-white bg-[#083DF5] shadow`,
    variant === "muted" && tw`text-gray-200 bg-neutral-700 hover:bg-opacity-50`,

    variant === "danger" && tw`font-bold text-[#083DF5] bg-red-500`,
    size === "swap" && tw`w-full text-xl font-bold shadow h-14`,

    tw`disabled:(border border-[#AEAEB2] bg-white text-secondary cursor-not-allowed)`,

    size === "sm" && tw`py-1.5 px-2 text-base`,
    size === "md" && tw`px-5 py-3 text-base`,

    icon && tw`rounded-full w-7 h-7 p-0!`,
  ]
);
