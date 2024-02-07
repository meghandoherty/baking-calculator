import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { IngredientConversionInformation } from "../../types";
import IngredientSelect from "../IngredientSelect";

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
    <Table variant="striped" style={{ whiteSpace: "normal" }} size="sm">
      <Thead>
        <Tr>
          <Th>Recipe Line</Th>
          <Th>Matched Ingredient</Th>
        </Tr>
      </Thead>
      <Tbody>
        {convertedRecipe.map((recipeLine, idx) => (
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
              />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </TableContainer>
);

export default MobdalConversionVerify;
