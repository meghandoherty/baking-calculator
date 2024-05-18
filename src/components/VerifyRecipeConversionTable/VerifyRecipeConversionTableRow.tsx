import { Checkbox, Input, Td, Tr } from "@chakra-ui/react";
import { SingleValue } from "chakra-react-select";
import { ingredientsWithMeasurements } from "../../ingredients";
import { IngredientConversionInformationForShoppingList } from "../../types";
import { getGramsForCompleteMeasurement } from "../../utils";
import IngredientSelect from "../IngredientSelect";

import styles from "./VerifyRecipeConversionTable.module.scss";

interface VerifyRecipeConversionTableRowProps {
  recipeLine: IngredientConversionInformationForShoppingList;
  idx: number;
  updateRecipeLine: (
    lineNumber: number,
    newInfo: IngredientConversionInformationForShoppingList
  ) => void;
}

const VerifyRecipeConversionTableRow = ({
  recipeLine,
  idx,
  updateRecipeLine,
}: VerifyRecipeConversionTableRowProps) => {
  const toggleUsingCustomMeasurement = (useCustomMeasurement: boolean) => {
    updateRecipeLine(idx, { ...recipeLine, useCustomMeasurement });
  };

  const updateQuantity = (newValue: string) => {
    updateRecipeLine(idx, {
      ...recipeLine,
      customMeasurementQuantity: newValue,
    });
  };

  const updateIngredient = (newValue: string) => {
    updateRecipeLine(idx, {
      ...recipeLine,
      customMeasurementUnit: newValue,
    });
  };

  const onIngredientChange = (
    option: SingleValue<{
      label: string;
      value: string;
    }> | null,
    idx: number
  ) => {
    let newItem: IngredientConversionInformationForShoppingList;
    // Item name removed, reset closestMeasurementKey and measurementInGrams (unless it was initially provided)
    if (option === null || recipeLine.parsedLine === undefined) {
      newItem = {
        ...recipeLine,
        closestMeasurementKey: undefined,
        measurementInGrams: recipeLine.metricUnit
          ? recipeLine.measurementInGrams
          : undefined,
      };
    } else {
      newItem = {
        ...recipeLine,
        closestMeasurementKey: option.value,
        measurementInGrams: recipeLine.metricUnit
          ? recipeLine.measurementInGrams
          : getGramsForCompleteMeasurement(
              recipeLine.parsedLine,
              ingredientsWithMeasurements[option.value]
            ),
      };
    }

    updateRecipeLine(idx, newItem);
  };

  return (
    <Tr
      key={`${idx} ${recipeLine.originalLine} ${recipeLine.closestMeasurementKey}`}
    >
      <Td>{recipeLine.originalLine}</Td>
      <Td>
        <Checkbox
          isChecked={recipeLine.useCustomMeasurement}
          onChange={(e) => toggleUsingCustomMeasurement(e.target.checked)}
          disabled={recipeLine.parsedLine === undefined}
        />
      </Td>
      <Td className={styles["measurement-cell"]}>
        {recipeLine.useCustomMeasurement ? (
          <>
            <Input
              type="number"
              value={recipeLine.customMeasurementQuantity || ""}
              onChange={(e) => updateQuantity(e.target.value)}
              variant="outline"
              placeholder="Quantity"
            />
            <Input
              value={recipeLine.customMeasurementUnit || ""}
              onChange={(e) => updateIngredient(e.target.value)}
              variant="outline"
              placeholder="Ingredient"
            />
          </>
        ) : (
          <IngredientSelect
            recipeLine={recipeLine}
            idx={idx}
            onIngredientChange={onIngredientChange}
          />
        )}
      </Td>
    </Tr>
  );
};

export default VerifyRecipeConversionTableRow;
