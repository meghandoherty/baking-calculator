import {
  Button,
  IconButton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import AddRecipeModal from "../components/AddRecipeModal";
import CloseIcon from "../icons/CloseIcon";
import { RecipeForShoppingList } from "../types";

const ShoppingList = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [shoppingListRecipes, setShoppingListRecipes] = useState<
    RecipeForShoppingList[]
  >(JSON.parse(localStorage.getItem("shoppingList") || "[]"));

  useEffect(() => {
    localStorage.setItem("shoppingList", JSON.stringify(shoppingListRecipes));
  }, [shoppingListRecipes]);

  const addRecipeToShoppingList = (newRecipe: RecipeForShoppingList) => {
    setShoppingListRecipes([...shoppingListRecipes, newRecipe]);
  };

  const ingredientsInTable = Array.from(
    new Set(shoppingListRecipes.map((x) => Object.keys(x.ingredients)).flat())
  ).sort();

  const hasMisc = shoppingListRecipes.some((x) => x.miscIngredients.length > 0);

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
        addRecipe={addRecipeToShoppingList}
      />
      <TableContainer className="full-width">
        <Table variant="striped" style={{ whiteSpace: "normal" }}>
          <Thead>
            <Tr>
              <Th>Ingredient</Th>
              {shoppingListRecipes.map((recipe, idx) => (
                <Th key={`${recipe.recipeName} ${idx}`}>
                  <div className="table-header-recipe-name">
                    {recipe.recipeName.length > 0
                      ? recipe.recipeName
                      : `Recipe ${idx + 1}`}
                    <IconButton
                      aria-label="Delete recipe from shopping list"
                      icon={<CloseIcon />}
                      size="xs"
                      variant="outline"
                      colorScheme="blue"
                      onClick={() =>
                        setShoppingListRecipes((prev) =>
                          prev.filter((_, idx2) => idx2 !== idx)
                        )
                      }
                    />
                  </div>
                </Th>
              ))}
              <Th>Total</Th>
            </Tr>
          </Thead>
          <Tbody>
            {ingredientsInTable.map((ingredientName) => (
              <Tr key={ingredientName}>
                <Td>{ingredientName}</Td>
                {shoppingListRecipes.map((recipe, idx) => {
                  const ingredientInRecipe = recipe.ingredients[ingredientName];

                  return (
                    <Td key={`${ingredientName} + ${idx}`}>
                      {ingredientInRecipe && (
                        <Tooltip
                          label={
                            <VStack spacing="0">
                              {ingredientInRecipe.lines.map((x, idx) => (
                                <span key={idx}>{x}</span>
                              ))}
                            </VStack>
                          }
                        >
                          <span>{ingredientInRecipe.totalQuantity}</span>
                        </Tooltip>
                      )}
                    </Td>
                  );
                })}
                <Td>
                  {shoppingListRecipes.reduce((res, curr) => {
                    if (curr.ingredients[ingredientName]) {
                      res += curr.ingredients[ingredientName].totalQuantity;
                    }
                    return res;
                  }, 0)}
                </Td>
              </Tr>
            ))}
            {!hasMisc ? null : (
              <Tr>
                <Td>Misc Ingredients</Td>
                {shoppingListRecipes.map((recipe, idx) => (
                  <Td key={`misc ${idx}`}>
                    {recipe.miscIngredients.length > 0
                      ? recipe.miscIngredients.join(", ")
                      : null}
                  </Td>
                ))}
                <Td>
                  {shoppingListRecipes
                    .filter((x) => x.miscIngredients.length > 0)
                    .map((x) => x.miscIngredients.join(", "))
                    .join(", ")}
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ShoppingList;
