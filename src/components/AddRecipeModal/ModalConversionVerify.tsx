import { Table, TableContainer, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import { IngredientConversionInformation } from "../../types";
import ModalConversionVerifyTableRow from "./ModalConversionVerifyTableRow";

interface ModalConversionVerifyProps {
  convertedRecipe: IngredientConversionInformation[];
  setConvertedRecipe: React.Dispatch<
    React.SetStateAction<IngredientConversionInformation[]>
  >;
}

const MobdalConversionVerify = ({
  convertedRecipe,
  setConvertedRecipe,
}: ModalConversionVerifyProps) => (
  <TableContainer className="full-width">
    <Table variant="striped" style={{ whiteSpace: "normal" }}>
      <Thead>
        <Tr>
          <Th>Recipe Line</Th>
          <Th>Matched Ingredient</Th>
          <Th>Use Custom Measurement?</Th>
          <Th>Quantity</Th>
          <Th>Unit</Th>
        </Tr>
      </Thead>
      <Tbody>
        {convertedRecipe.map((recipeLine, idx) => (
          <ModalConversionVerifyTableRow
            key={`${idx} ${recipeLine.originalLine} ${recipeLine.closestMeasurementKey}`}
            recipeLine={recipeLine}
            idx={idx}
            convertedRecipe={convertedRecipe}
            setConvertedRecipe={setConvertedRecipe}
          />
        ))}
      </Tbody>
    </Table>
  </TableContainer>
);

export default MobdalConversionVerify;
