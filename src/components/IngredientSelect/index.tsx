import { Select, SingleValue } from "chakra-react-select";
import { ingredientNameSelectOptions } from "../../constants";
import { ingredientsWithMeasurements } from "../../ingredients";
import { IngredientConversionInformation } from "../../types";
import { getGramsForCompleteMeasurement } from "../../utils";

interface IngredientSelectProps {
  recipeLine: IngredientConversionInformation;
  idx: number;
  convertedRecipe: IngredientConversionInformation[];
  setConvertedRecipe: React.Dispatch<
    React.SetStateAction<IngredientConversionInformation[]>
  >;
}

const IngredientSelect = ({
  recipeLine,
  idx,
  convertedRecipe,
  setConvertedRecipe,
}: IngredientSelectProps) => {
  const onIngredientChange = (
    option: SingleValue<{
      label: string;
      value: string;
    }> | null,
    modifiedIndex: number
  ) => {
    setConvertedRecipe(
      convertedRecipe.map((item, idx) => {
        if (idx !== modifiedIndex) return item;

        // Item name removed, reset closestMeasurementKey and measurementInGrams (unlcess it was initially provided)
        if (option === null || item.parsedLine === undefined) {
          return {
            ...item,
            closestMeasurementKey: undefined,
            measurementInGrams: item.metricUnit
              ? item.measurementInGrams
              : undefined,
          };
        }

        // New item match, recalcualte measurementInGrams unless it's from an initially provided given metric unit
        return {
          ...item,
          closestMeasurementKey: option.value,
          measurementInGrams: item.metricUnit
            ? item.measurementInGrams
            : getGramsForCompleteMeasurement(
                item.parsedLine,
                ingredientsWithMeasurements[option.value]
              ),
        };
      })
    );
  };

  return (
    <Select
      className="select-inline"
      options={ingredientNameSelectOptions}
      size="sm"
      useBasicStyles
      variant="flushed"
      isClearable
      isDisabled={recipeLine.parsedLine === undefined}
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
