import {
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { IngredientConversionInformation } from "../../types";
import { getConvertedLine } from "../../utils";
import IngredientSelect from "../IngredientSelect";

interface RecipeTableProps {
  data: IngredientConversionInformation[];
  setConvertedRecipe: React.Dispatch<
    React.SetStateAction<IngredientConversionInformation[]>
  >;
  scale: number;
  keepTeaspoons: boolean;
  keepEggs: boolean;
}

const RecipeTable = ({
  data,
  setConvertedRecipe,
  scale,
  keepTeaspoons,
  keepEggs,
}: RecipeTableProps) => {
  if (!data.length) return null;

  return (
    <section className="full-width">
      <Heading as="h2" size="lg" textAlign="center" mt={10} mb={10}>
        Detailed Conversion
      </Heading>
      <TableContainer>
        <Table variant="striped" style={{ whiteSpace: "normal" }}>
          <Thead>
            <Tr>
              <Th>Original Line</Th>
              <Th>Matching Ingredient</Th>
              <Th>Converted Line</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((recipeLine, idx) => (
              <Tr
                key={`${idx} ${recipeLine.originalLine} ${recipeLine.closestMeasurementKey}`}
              >
                <Td>{recipeLine.originalLine}</Td>
                <Td>
                  <IngredientSelect
                    recipeLine={recipeLine}
                    idx={idx}
                    convertedRecipe={data}
                    setConvertedRecipe={setConvertedRecipe}
                  />
                </Td>
                <Td>
                  {getConvertedLine(recipeLine, scale, keepTeaspoons, keepEggs)}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </section>
  );
};
export default RecipeTable;
