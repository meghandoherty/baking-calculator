import { Table, TableContainer, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import { IngredientConversionInformationForShoppingList } from "../../types";
import ModalConversionVerifyTableRow from "./ModalConversionVerifyTableRow";

interface ModalConversionVerifyProps {
  convertedRecipe: IngredientConversionInformationForShoppingList[];
  updateRecipeLine: (
    lineNumber: number,
    newInfo: IngredientConversionInformationForShoppingList
  ) => void;
}

const MobdalConversionVerify = ({
  convertedRecipe,
  updateRecipeLine,
}: ModalConversionVerifyProps) => (
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
          <ModalConversionVerifyTableRow
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

export default MobdalConversionVerify;
