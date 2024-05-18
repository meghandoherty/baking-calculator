import Fuse from "fuse.js";
import { ingredientsWithMeasurements } from "./ingredients";
import { ConversionRate } from "./types";

export const ingredientNames = Object.keys(ingredientsWithMeasurements).sort();
export const ingredientNameSelectOptions = ingredientNames.map((name) => ({
  value: name,
  label: name,
}));
export const ingredientsFuse = new Fuse(ingredientNames, {
  includeScore: true,
  ignoreLocation: true,
});

// For math, first number is unit from map, second number is unit from recipe
export const conversionRates: ConversionRate = {
  cup: {
    tablespoon: 1 / 16,
    teaspoon: 1 / 48,
  },
  tablespoon: {
    teaspoon: 1 / 3,
    cup: 16,
  },
  teaspoon: {
    tablespoon: 3,
    cup: 48,
  },
};

// Aliases for ingredients that have slightly different names in the ingredients.json file and confuse Fuse.js
export const ingredientAliases: Record<string, string> = {
  "powdered sugar": "confectioners sugar",
  "light brown sugar": "brown sugar",
  sugar: "sugar (granulated (white)",
  "salted butter": "butter",
  "unsalted butter": "butter",
  milk: "milk (fresh)",
  "whole milk": "milk (fresh)",
  "large egg": "Egg (fresh)",
  "egg white": "Egg white (fresh)",
  "semi-sweet chocolate chips": "chocolate chips",
  "canola oil": "vegetable oil",
  "light or dark corn syrup": "corn syrup",
  "dutch process cocoa powder": "cocoa powder (unsweetened)",
  "dark brown sugar": "Brown sugar (dark or light, packed)",
  flour: "All-Purpose Flour",
  "unbleached all-purpose flour": "All-Purpose Flour",
  "vanilla almond milk": "Almond milk",
  "chopped walnuts": "walnuts (chopped)",
  oil: "vegetable oil",
};
