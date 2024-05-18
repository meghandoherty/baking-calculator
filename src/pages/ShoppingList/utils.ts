import { ingredientsWithMeasurements } from "../../ingredients";
import { EGG_AMOUNT, EGG_SIZE } from "../../regex";
import { RecipeForShoppingList } from "../../types";

export const addIngredientQuantities = (
  shoppingListRecipes: RecipeForShoppingList[],
  ingredientName: string,
  isCustomIngredientMap: Record<string, boolean>,
  shouldConvertEggs: boolean
): string => {
  const totalQuantity = shoppingListRecipes.reduce((res, curr) => {
    if (curr.ingredients[ingredientName]) {
      res += curr.ingredients[ingredientName].totalQuantity;
    }
    return res;
  }, 0);

  if (
    !shouldConvertEggs &&
    ["Egg (fresh)", "Egg white (fresh", "Egg yolk (fresh)"].includes(
      ingredientName
    )
  ) {
    const initial: Record<string, number> = {};
    const sizes = Object.keys(
      ingredientsWithMeasurements[ingredientName]
    ).reduce((obj, size) => {
      obj[size] = 0;
      return obj;
    }, initial);

    for (const recipe of shoppingListRecipes) {
      if (recipe.ingredients[ingredientName]) {
        for (const parsedLine of recipe.ingredients[ingredientName]
          .parsedLines) {
          sizes[parsedLine.regexMatch[EGG_SIZE]] += parseInt(
            parsedLine.regexMatch[EGG_AMOUNT]
          );
        }
      }
    }

    return `${Object.entries(sizes)
      .filter(([, value]) => value !== 0)
      .map(([size, value]) => `${value} ${size}`)
      .join(", ")} ${ingredientName}`;
  }

  return `${totalQuantity} ${
    isCustomIngredientMap[ingredientName] ? " " : " g "
  } ${ingredientName}`;
};
