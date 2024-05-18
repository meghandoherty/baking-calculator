import { ingredientsWithMeasurements } from "../../ingredients";
import { EGG_AMOUNT, EGG_SIZE } from "../../regex";
import { RecipeForShoppingList } from "../../types";

export const addIngredientQuantities = (
  shoppingListRecipes: RecipeForShoppingList[],
  ingredientName: string,
  isCustomIngredientMap: Record<string, boolean>,
  dontConvertEggs: boolean,
  dontConvertButter: boolean
): string => {
  const totalQuantity = Math.ceil(
    shoppingListRecipes.reduce((res, currentRecipe) => {
      if (currentRecipe.ingredients[ingredientName]) {
        res +=
          currentRecipe.ingredients[ingredientName].totalQuantity *
          currentRecipe.scale;
      }
      return res;
    }, 0)
  );

  // Keep eggs as separate sizes
  if (
    dontConvertEggs &&
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
          sizes[parsedLine.regexMatch[EGG_SIZE]] +=
            parseInt(parsedLine.regexMatch[EGG_AMOUNT]) * recipe.scale;
        }
      }
    }

    return `${Object.entries(sizes)
      .filter(([, value]) => value !== 0)
      .map(
        ([size, value]) =>
          `${value} ${size}${value % 1 !== 0 ? " (rounded up)" : ""}`
      )
      .join(", ")} ${ingredientName}`;
  }

  if (dontConvertButter && ingredientName === "Butter") {
    return `${Math.ceil(
      totalQuantity / ingredientsWithMeasurements.Butter.stick!
    )} sticks ${ingredientName} (rounded up)`;
  }

  return `${totalQuantity} ${
    isCustomIngredientMap[ingredientName] ? " " : " g "
  } ${ingredientName}`;
};
