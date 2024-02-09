import { Checkbox, Input, Td, Tr } from "@chakra-ui/react";
import { useState } from "react";
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
  const [usingCustomMeasurement, setUsingCustomMeasurement] = useState(
    recipeLine.parsedLine === undefined
  );
  const [unit, setUnit] = useState("");
  const [quantity, setQuantity] = useState("");

  return (
    <Tr
      key={`${idx} ${recipeLine.originalLine} ${recipeLine.closestMeasurementKey}`}
    >
      <Td>{recipeLine.originalLine}</Td>
      <Td>
        <IngredientSelect
          recipeLine={recipeLine}
          idx={idx}
          convertedRecipe={convertedRecipe}
          setConvertedRecipe={setConvertedRecipe}
          isDisabled={usingCustomMeasurement}
        />
      </Td>
      <Td>
        <Checkbox
          isChecked={usingCustomMeasurement}
          onChange={(e) => setUsingCustomMeasurement(e.target.checked)}
          disabled={recipeLine.parsedLine === undefined}
        />
      </Td>
      <Td>
        <Input
          type="number"
          disabled={!usingCustomMeasurement}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </Td>
      <Td>
        <Input
          disabled={!usingCustomMeasurement}
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />
      </Td>
    </Tr>
  );
};

export default ModalConversionVerifyTableRow;
