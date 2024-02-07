import {
  Button,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import AddRecipeModal from "../components/AddRecipeModal";
import { IngredientConversionInformation } from "../types";

const ShoppingList = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [recipesIngredients, setRecipesIngredients] = useState<
    Record<string, number>[]
  >([]);

  const addRecipeIngredients = (
    ingredients: IngredientConversionInformation[]
  ) => {
    // Add values of the same ingredient together
    const recipeGroupedByIngredients = ingredients.reduce<
      Record<string, number>
    >((res, lineInfo) => {
      if (lineInfo.closestMeasurementKey) {
        let value = res[lineInfo.closestMeasurementKey] || 0;

        if (lineInfo.measurementInGrams !== undefined) {
          if (Array.isArray(lineInfo.measurementInGrams)) {
            // TODO: range ok to pick the largest?
            value = value + lineInfo.measurementInGrams[1];
          } else {
            value = value + lineInfo.measurementInGrams;
          }
        }

        res[lineInfo.closestMeasurementKey] = value;
      }

      // TODO: things with no match
      return res;
    }, {});

    setRecipesIngredients([...recipesIngredients, recipeGroupedByIngredients]);

    console.log(
      "🚀 ~ ShoppingList ~ recipeGroupedByIngredients:",
      recipeGroupedByIngredients
    );
  };

  const ingredientsInTable = Array.from(
    new Set(recipesIngredients.map(Object.keys).flat())
  ).sort();

  return (
    <>
      <Button
        colorScheme="blue"
        className="align-self-flex-end"
        onClick={onOpen}
      >
        Add Recipe
      </Button>
      <AddRecipeModal
        isOpen={isOpen}
        onClose={onClose}
        addRecipe={addRecipeIngredients}
      />
      <TableContainer className="full-width">
        <Table variant="striped" style={{ whiteSpace: "normal" }}>
          <Thead>
            <Tr>
              <Th>Ingredient</Th>
              {recipesIngredients.map((_, idx) => (
                <Th key={idx}>Recipe {idx + 1}</Th>
              ))}
              <Th>Total</Th>
            </Tr>
          </Thead>
          <Tbody>
            {ingredientsInTable.map((ingredientName) => (
              <Tr key={ingredientName}>
                <Td>{ingredientName}</Td>
                {recipesIngredients.map((recipe, idx) => (
                  <Td key={`${ingredientName} + ${idx}`}>
                    {recipe[ingredientName] ? recipe[ingredientName] : null}
                  </Td>
                ))}
                <Td>
                  {recipesIngredients.reduce((res, curr) => {
                    if (curr[ingredientName]) {
                      res += curr[ingredientName];
                    }
                    return res;
                  }, 0)}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ShoppingList;
