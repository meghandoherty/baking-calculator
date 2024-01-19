import Fuse, { FuseResult } from "fuse.js";

import { numericQuantity } from "numeric-quantity";
import { ingredientsWithMeasurements } from "./ingredients";
import {
  ConversionRate,
  MEASUREMENT_OPTION,
  Measurement,
  MeasurementOptions,
  isConversionRateKey,
  isMeasurementOption,
} from "./types";

// For math, first number is unit from map, second number is unit from recipe
const conversionRates: ConversionRate = {
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
const ingredientAliases: Record<string, string> = {
  "powdered sugar": "confectioners sugar",
  "light brown sugar": "brown sugar",
  sugar: "sugar (granulated (white)",
  "salted butter": "butter",
  "unsalted butter": "butter",
  milk: "milk (fresh)",
  "large egg": "Egg (fresh)",
  "semi-sweet chocolate chips": "chocolate chips",
  "canola oil": "vegetable oil",
  "unsweetened cocoa powder": "cocoa powder",
  "light or dark corn syrup": "corn syrup",
};

const fuse = new Fuse(Object.keys(ingredientsWithMeasurements), {
  includeScore: true,
  ignoreLocation: true,
});

const numberRegex = /^([\d\s/½¼¾⅓⅔⅕⅖⅗⅘⅙⅔¾⅛⅜⅝⅞\-–]+)/g;
const unitRegex = new RegExp(`(${MEASUREMENT_OPTION.join("|")})(\\.)?`, "gi");

const numberAndMeasurementRegex = new RegExp(
  `^([\\d\\s½¼¾⅓⅔⅕⅖⅗⅘⅙⅛⅜⅝⅞/]+([-–]|to)?(${MEASUREMENT_OPTION.join(
    "|"
  )})?(\\.)?s?\\s?(plus|minus|\\+)?)+(\\(\\d+\\s(ounces|oz|grams|g)\\))?`,
  "gi"
);

const standardizeUnit = (unit: MeasurementOptions): MeasurementOptions => {
  if (unit === "tbsp") return "tablespoon";
  else if (unit === "tsp") return "teaspoon";

  return unit;
};

/* Given a line from a recipe, separate the number and measurement from the ingredient name */
export const getNumberMeasurementAndIngredient = (
  recipeLine: string
): [string, string] => {
  const numberAndMeasurement = recipeLine.match(numberAndMeasurementRegex);
  const numberAndMeasurementPart = numberAndMeasurement
    ? numberAndMeasurement[0].trim()
    : "";

  // Remove the measurement part to find the ingredient name
  const ingredientName = recipeLine
    .substring(numberAndMeasurementPart.length)
    .trim();

  return [numberAndMeasurementPart, ingredientName];
};

export const findClosestKeySingle = (
  ingredientName: string
): FuseResult<string> | undefined => {
  const searchTerm =
    ingredientName in ingredientAliases
      ? ingredientAliases[ingredientName]
      : ingredientName;

  const closestIngredient = fuse.search(searchTerm);
  if (
    closestIngredient.length > 0 &&
    closestIngredient[0].score !== undefined &&
    closestIngredient[0].score < 0.6
  ) {
    return closestIngredient[0];
  } else {
    console.error(`No match found for '${searchTerm}!'`, closestIngredient);
    return undefined;
  }
};

/* Given an ingredient name, find the closest match in the ingredients map */
export const findClosestKey = (
  ingredientName: string
): Measurement | undefined => {
  // Remove anything in parentheses or after comma, that's usually about temperature or other info
  const ingredientWithoutParentheses = ingredientName.replace(
    / *\([^)]*\) */g,
    ""
  );
  const ingredientNameWithoutComma = ingredientWithoutParentheses.split(",")[0];

  // Are the ingredients or-ed? If so, compare
  const orIngredients = ingredientWithoutParentheses.match(/(.*)\sor\s(.*)/i);
  if (orIngredients) {
    // Figure out closest key for both
    const closestKey1 = findClosestKeySingle(orIngredients[1]);
    const closestKey2 = findClosestKeySingle(orIngredients[2]);

    if (closestKey1 && closestKey2) {
      // Score shouldn't be undefined, but just in case
      if (closestKey1.score === undefined)
        return ingredientsWithMeasurements[closestKey2.item];
      else if (closestKey2.score === undefined)
        return ingredientsWithMeasurements[closestKey1.item];
      // Return the one with the lower score
      else
        return closestKey1.score < closestKey2.score
          ? ingredientsWithMeasurements[closestKey1.item]
          : ingredientsWithMeasurements[closestKey2.item];
    } else if (closestKey1) {
      // Only the first ingredient had a match
      return ingredientsWithMeasurements[closestKey1.item];
    } else if (closestKey2) {
      // Only the second ingredient had a match
      return ingredientsWithMeasurements[closestKey2.item];
    } else {
      // Neither had a match
      return undefined;
    }
  } else {
    const closestKey = findClosestKeySingle(ingredientNameWithoutComma);
    return closestKey
      ? ingredientsWithMeasurements[closestKey.item]
      : undefined;
  }
};

export const getGramsForSingleMeasurement = (
  ingredientName: string,
  numberAndMeasurement: string,
  measurements: Measurement,
  amount: string
): number | undefined => {
  // Convert the string amount to a number
  const amountAsNumber = numericQuantity(amount);

  // Get the unit
  const unit = numberAndMeasurement.match(unitRegex);
  let unitPart = unit ? unit[0].trim() : "";

  // The input does not have a unit?
  if (!unitPart) {
    // Handle weird egg case - assume large
    if (ingredientName.toLowerCase().includes("egg")) {
      unitPart = "large";
    } else {
      console.error(`Couldn't find unit in ${numberAndMeasurement}`);
      return undefined;
    }
  }

  if (isMeasurementOption(unitPart)) {
    const standardizedUnit = standardizeUnit(unitPart);
    // Unit matches what we have in measurement
    if (measurements[standardizedUnit] !== undefined) {
      return +(amountAsNumber * measurements[standardizedUnit]!).toFixed(2);
      // See if we can convert the unit - only for cups, tablespoons, and teaspoons
    } else if (isConversionRateKey(standardizedUnit)) {
      for (const measurementOption in measurements) {
        if (isConversionRateKey(measurementOption)) {
          let result =
            amountAsNumber *
            measurements[measurementOption]! *
            conversionRates[measurementOption][standardizedUnit]!;
          result = +result.toFixed(2);
          return result;
        }
      }
    }
  }

  // Something went wrong, return the initial input
  return undefined;
};

/* Get numbers from a measurement. This could be a range like 10 - 12 */
const getQuantityFrmoMeasurement = (
  numberAndMeasurement: string
): string | undefined => {
  const amount = numberAndMeasurement.match(numberRegex);

  if (!amount) {
    console.error(`Couldn't find amount in ${numberAndMeasurement}`);
    return undefined;
  }

  return amount[0].trim();
};

/* Given an ingredient name and measurement, convert it to the number of grams */
export const getGramsForCompleteMeasurement = (
  ingredientName: string,
  numberAndMeasurement: string,
  measurements: Measurement
): string => {
  // Do we need to add or subtract anything?
  const plusOrMinus = numberAndMeasurement.match(/(.*)\s(plus|minus|\+)(.*)/i);
  if (plusOrMinus) {
    const quantity1 = getQuantityFrmoMeasurement(plusOrMinus[1]);
    const quantity2 = getQuantityFrmoMeasurement(plusOrMinus[3]);
    if (!quantity1 || !quantity2) {
      console.error(
        `Couldn't find amount in ${numberAndMeasurement} to add or subtract`
      );
      return "";
    }
    const grams1 = getGramsForSingleMeasurement(
      ingredientName,
      plusOrMinus[1].trim(),
      measurements,
      quantity1
    );
    const grams2 = getGramsForSingleMeasurement(
      ingredientName,
      plusOrMinus[3].trim(),
      measurements,
      quantity2
    );
    console.log(numberAndMeasurement, grams1, grams2);

    if (!grams1 || !grams2) {
      console.error(
        `Couldn't find grams for ${numberAndMeasurement} to add or subtract`
      );
      return numberAndMeasurement;
    }

    if (plusOrMinus[2] === "plus" || plusOrMinus[2] === "+") {
      return `${grams1 + grams2} g`;
    } else {
      return `${grams1 - grams2} g`;
    }
  }

  // Get the amount
  const quantity = getQuantityFrmoMeasurement(numberAndMeasurement);
  if (!quantity) return numberAndMeasurement;

  // Is the amount a range?
  const possibleRange = quantity.split(/[-–+]/g);

  if (possibleRange.length === 1) {
    const gramsAmount = getGramsForSingleMeasurement(
      ingredientName,
      numberAndMeasurement,
      measurements,
      quantity
    );

    if (!gramsAmount) return numberAndMeasurement;
    else return `${gramsAmount} g`;
  } else if (possibleRange.length === 2) {
    return `${possibleRange
      .map((x) =>
        getGramsForSingleMeasurement(
          ingredientName,
          numberAndMeasurement,
          measurements,
          x.trim()
        )
      )
      .join(" - ")} g`;
  } else {
    console.error(
      `Had a range of 3 or more in ${numberAndMeasurement}, not sure how to handle`
    );
  }

  return numberAndMeasurement;
};

const convertOuncesToGrams = (ounces: number): number =>
  +(ounces * 28.349523125).toFixed(2);

/* Given a measurement in ounces, convert it into grams with some easy multiplication */
export const getGramsFromOuncesOrGrams = (
  numberAndMeasurement: string
): string => {
  // Is the info in parentheses?
  const inParentheses = numberAndMeasurement.match(
    /\((\d+)\s(ounces|oz|grams|g)\)/
  );
  if (inParentheses) {
    if (inParentheses[2] === "oz" || inParentheses[2] === "ounces") {
      return `${convertOuncesToGrams(numericQuantity(inParentheses[1]))} g`;
    } else {
      return `${numericQuantity(inParentheses[1])} g`;
    }
  }

  // Get the amount
  const quantity = getQuantityFrmoMeasurement(numberAndMeasurement);
  if (!quantity) return numberAndMeasurement;

  // Is the amount a range?
  const possibleRange = quantity.split(/[-–+]/g);

  if (possibleRange.length === 1) {
    return `${convertOuncesToGrams(
      numericQuantity(possibleRange[0].trim())
    )} g`;
  } else if (possibleRange.length === 2) {
    return `${possibleRange
      .map((x) => convertOuncesToGrams(numericQuantity(x.trim())))
      .join(" g - ")} g`;
  } else {
    console.error(
      `Had a range of 3 or more in ${numberAndMeasurement}, not sure how to handle`
    );
  }

  return numberAndMeasurement;
};
