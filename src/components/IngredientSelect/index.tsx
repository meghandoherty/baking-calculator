import { Select, SingleValue } from "chakra-react-select";
import { ingredientNameSelectOptions } from "../../constants";
import { IngredientConversionInformation } from "../../types";

interface IngredientSelectProps {
  recipeLine: IngredientConversionInformation;
  idx: number;
  onIngredientChange: (
    option: SingleValue<{
      label: string;
      value: string;
    }> | null,
    modifiedIndex: number
  ) => void;
  isDisabled?: boolean;
}

const IngredientSelect = ({
  recipeLine,
  idx,
  onIngredientChange,
  isDisabled,
}: IngredientSelectProps) => {
  return (
    <Select
      className="select-inline"
      options={ingredientNameSelectOptions}
      size="sm"
      useBasicStyles
      variant="flushed"
      isClearable
      isDisabled={isDisabled || recipeLine.parsedLine === undefined}
      menuPlacement="auto"
      onChange={(option) => onIngredientChange(option, idx)}
      menuPortalTarget={document.body}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      }}
      placeholder={
        recipeLine.parsedLine === undefined
          ? "Unable to parse line"
          : "Select an ingredient"
      }
      defaultValue={
        recipeLine.closestMeasurementKey
          ? {
              label: recipeLine.closestMeasurementKey,
              value: recipeLine.closestMeasurementKey,
            }
          : undefined
      }
    />
  );
};

export default IngredientSelect;
