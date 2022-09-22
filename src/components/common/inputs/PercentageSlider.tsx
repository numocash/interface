import {
  SliderHandle,
  SliderInput as ReachSlider,
  SliderRange,
  SliderTrack,
} from "@reach/slider";
import tw, { css, styled } from "twin.macro";

interface Props {
  input: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}

export const PercentageSlider: React.FC<Props> = ({
  input,
  onChange,
  disabled,
}: Props) => {
  return (
    <div tw="flex items-center justify-between w-full">
      <div tw="flex">
        <div tw="rounded-xl text-2xl w-20 justify-center">
          {input.toFixed(0)}%
        </div>
      </div>
      <div tw="w-5/6 mr-3">
        <SliderInput
          value={input}
          min={0}
          max={100}
          step={1}
          onChange={(e) => onChange(e)}
          disabled={disabled}
        >
          <SliderTrack>
            <SliderRange />
            <SliderHandle />
          </SliderTrack>
        </SliderInput>
      </div>
    </div>
  );
};

const styledSlider = styled(ReachSlider);

// TODO: could we reuse the other one

export const SliderInput = styledSlider(
  () => css`
    background: none;

    [data-reach-slider-range] {
      background: none;
    }

    [data-reach-slider-track] {
      ${tw`h-1 bg-gray-800 rounded bg-gradient-to-r from-gray-600 to-gray-200`}
    }

    [data-reach-slider-handle] {
      ${tw`bg-action`}

      width: 22px;
      height: 22px;
      border-radius: 15px;

      -webkit-appearance: none;
      appearance: none;
      cursor: pointer;
      // box-shadow: 0px 6px 12px 8px rgba(0, 0, 0, 0.3);
    }
  `
);
