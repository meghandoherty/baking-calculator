import { Table, TableContainer, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import { IngredientConversionInformationForShoppingList } from "../../types";
import VerifyRecipeConverstionTableRow from "./VerifyRecipeConversionTableRow";

interface VerifyRecipeConversionTableProps {
  convertedRecipe: IngredientConversionInformationForShoppingList[];
  updateRecipeLine: (
    lineNumber: number,
    newInfo: IngredientConversionInformationForShoppingList
  ) => void;
}

const VerifyRecipeConversionTable = ({
  convertedRecipe,
  updateRecipeLine,
}: VerifyRecipeConversionTableProps) => (
  <TableContainer className="full-width">
    <Table style={{ whiteSpace: "normal" }}>
      <Thead>
        <Tr>
          <Th>Recipe Line</Th>
          <Th>Use Custom Measurement?</Th>
          <Th>Measurement</Th>
        </Tr>
      </Thead>
      <Tbody>
        {convertedRecipe.map((recipeLine, idx) => (
          <VerifyRecipeConverstionTableRow
            key={`${idx} ${recipeLine.originalLine} ${recipeLine.closestMeasurementKey}`}
            recipeLine={recipeLine}
            idx={idx}
            updateRecipeLine={updateRecipeLine}
          />
        ))}
      </Tbody>
    </Table>
  </TableContainer>
);

export default VerifyRecipeConversionTable;
