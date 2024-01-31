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
import { Select, SingleValue } from "chakra-react-select";
import { useMemo } from "react";
import { ingredientNames } from "../../constants";
import { ingredientsWithMeasurements } from "../../ingredients";
import { IngredientConversionInformation } from "../../types";
import { getConvertedLine, getGramsForCompleteMeasurement } from "../../utils";

interface RecipeTableProps {
  data: IngredientConversionInformation[];
  setConvertedRecipe: React.Dispatch<
    React.SetStateAction<IngredientConversionInformation[]>
  >;
  scale: number;
  keepTeaspoons: boolean;
}

const RecipeTable = ({
  data,
  setConvertedRecipe,
  scale,
  keepTeaspoons,
}: RecipeTableProps) => {
  const ingredientNameOptions = useMemo(
    () => ingredientNames.map((name) => ({ value: name, label: name })),
    []
  );
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
    <section className="table-container">
      <Heading as="h2" textAlign="center" mb={10}>
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
                  <Select
                    className="select-inline"
                    options={ingredientNameOptions}
                    size="sm"
                    useBasicStyles
                    variant="flushed"
                    isClearable
                    isDisabled={recipeLine.parsedLine === undefined}
                    menuPlacement="auto"
                    onChange={(option) => onIngredientChange(option, idx)}
                    menuPortalTarget={document.querySelector("body")}
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
                </Td>
                <Td>{getConvertedLine(recipeLine, scale, keepTeaspoons)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </section>
  );
};
export default RecipeTable;
