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
import { getGramsForCompleteMeasurement } from "../../utils";

interface RecipeTableProps {
  data: IngredientConversionInformation[];
  setConvertedRecipe: React.Dispatch<
    React.SetStateAction<IngredientConversionInformation[]>
  >;
}

const RecipeTable = ({ data, setConvertedRecipe }: RecipeTableProps) => {
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
    index: number
  ) => {
    setConvertedRecipe(
      data.map((item, idx) => {
        if (idx !== index) return item;

        if (option === null || !data[idx].parsedLine === undefined) {
          return {
            ...item,
            closestMeasurementKey: undefined,
            newLine: item.originalLine,
          };
        }

        return {
          ...item,
          closestMeasurementKey: option.value,
          newLine: `${getGramsForCompleteMeasurement(
            data[idx].parsedLine!,
            ingredientsWithMeasurements[option.value]
          )} ${data[idx].parsedLine!.ingredientName}`,
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
              <Tr key={`${idx} ${recipeLine.newLine}`}>
                <Td>{recipeLine.originalLine}</Td>
                <Td>
                  <div style={{ display: "inline-flex" }}>
                    <Select
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
                  </div>
                </Td>
                <Td>{recipeLine.newLine}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </section>
  );
};

export default RecipeTable;
