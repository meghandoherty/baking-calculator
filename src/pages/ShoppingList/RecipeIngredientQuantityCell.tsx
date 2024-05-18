import { Td, Tooltip, VStack } from "@chakra-ui/react";
import { AggregatedIngredientInfo } from "../../types";

interface RecipeIngredientQuantityCellProps {
  ingredientInRecipe: AggregatedIngredientInfo;
  scale: number;
}

const RecipeIngredientQuantityCell = ({
  ingredientInRecipe,
  scale,
}: RecipeIngredientQuantityCellProps) => {
  if (!ingredientInRecipe) return <Td></Td>;

  return (
    <Td>
      <Tooltip
        label={
          <VStack spacing="0">
            {ingredientInRecipe.lines.map((ingredientInRecipe, idx) => (
              <span key={idx}>
                {ingredientInRecipe} {scale !== 1 && `* ${scale}`}
              </span>
            ))}
          </VStack>
        }
      >
        <span>{Math.round(ingredientInRecipe.totalQuantity * scale)}</span>
      </Tooltip>
    </Td>
  );
};

export default RecipeIngredientQuantityCell;
