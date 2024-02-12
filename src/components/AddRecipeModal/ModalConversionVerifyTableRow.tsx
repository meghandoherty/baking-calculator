import { Checkbox, Input, Td, Tr } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { numbersAtBeginningOfLineRegex } from "../../regex";
import { IngredientConversionInformation } from "../../types";
import IngredientSelect from "../IngredientSelect";

interface ModalConversionVerifyTableRowProps {
  recipeLine: IngredientConversionInformation;
  idx: number;
  convertedRecipe: IngredientConversionInformation[];
  setConvertedRecipe: React.Dispatch<
    React.SetStateAction<IngredientConversionInformation[]>
  >;
}

const ModalConversionVerifyTableRow = ({
  recipeLine,
  idx,
  convertedRecipe,
  setConvertedRecipe,
}: ModalConversionVerifyTableRowProps) => {
  const numberMatch = recipeLine.originalLine.match(
    numbersAtBeginningOfLineRegex
  );
  const [usingCustomMeasurement, setUsingCustomMeasurement] = useState(
    recipeLine.parsedLine === undefined
  );
  const [unit, setUnit] = useState(numberMatch ? numberMatch[3] : "");
  const [quantity, setQuantity] = useState(
    numberMatch ? (numberMatch[2] ? numberMatch[2] : numberMatch[1]) : ""
  );

  useEffect(() => {}, [unit, quantity]);

  return (
    <Tr
      key={`${idx} ${recipeLine.originalLine} ${recipeLine.closestMeasurementKey}`}
    >
      <Td>{recipeLine.originalLine}</Td>
      <Td>
        <Checkbox
          isChecked={usingCustomMeasurement}
          onChange={(e) => setUsingCustomMeasurement(e.target.checked)}
          disabled={recipeLine.parsedLine === undefined}
        />
      </Td>
      <Td className="add-recipe-measurement-cell">
        {usingCustomMeasurement ? (
          <>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              variant="outline"
              placeholder="Quantity"
            />
            <Input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              variant="outline"
              placeholder="Ingredient"
            />
          </>
        ) : (
          <IngredientSelect
            recipeLine={recipeLine}
            idx={idx}
            convertedRecipe={convertedRecipe}
            setConvertedRecipe={setConvertedRecipe}
            isDisabled={usingCustomMeasurement}
          />
        )}
      </Td>
    </Tr>
  );
};

export default ModalConversionVerifyTableRow;
