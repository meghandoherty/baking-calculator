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
import { SingleValue } from "chakra-react-select";
import { ingredientsWithMeasurements } from "../../ingredients";
import { IngredientConversionInformation } from "../../types";
import { getConvertedLine, getGramsForCompleteMeasurement } from "../../utils";
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

  const onIngredientChange = (
    option: SingleValue<{
      label: string;
      value: string;
    }> | null,
    modifiedIndex: number
  ) => {
    setConvertedRecipe(
      data.map((item, idx) => {
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
                    onIngredientChange={onIngredientChange}
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
