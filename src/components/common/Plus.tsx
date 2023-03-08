import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  onClick?: () => void;
  icon: "plus" | "minus";
}

export const Plus: React.FC<Props> = ({ onClick, icon }: Props) => {
  return (
    <button
      onClick={onClick}
      tw="flex items-center justify-center bg-gray-200 rounded-lg h-6 w-6"
    >
      <div tw=" justify-center items-center flex text-sm">
        <FontAwesomeIcon icon={icon === "plus" ? faPlus : faMinus} fixedWidth />
      </div>
    </button>
  );
};
