import { faArrowDown, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  onClick?: () => void;
  icon: "arrow" | "plus";
}

export const CenterSwitch: React.FC<Props> = ({ onClick, icon }: Props) => {
  return (
    <div tw="w-full flex justify-center items-center h-1">
      <button
        onClick={onClick}
        tw="flex items-center justify-center self-center absolute bg-action border-container dark:(bg-action-d border-container-d) border-4 rounded-xl h-8 w-8"
      >
        <div tw="text-secondary dark:text-secondary-d justify-center items-center flex text-sm">
          <FontAwesomeIcon
            icon={icon === "arrow" ? faArrowDown : faPlus}
            fixedWidth
          />
        </div>
      </button>
    </div>
  );
};
