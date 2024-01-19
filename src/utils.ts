import Fuse from "fuse.js";

import { numericQuantity } from "numeric-quantity";
import { ingredientsWithMeasurements } from "./ingredients";
import {
  ConversionRate,
  MEASUREMENT_OPTION,
  Measurement,
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
const aliases: Record<string, string> = {
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
};

const fuse = new Fuse(Object.keys(ingredientsWithMeasurements), {
  includeScore: true,
  ignoreLocation: true,
  threshold: 0.5,
});

const numberRegex = /^([\d\s/½¼¾⅓⅔⅕⅖⅗⅘⅙⅔¾⅛⅜⅝⅞\-–]+)/g;
const unitRegex = new RegExp(`(${MEASUREMENT_OPTION.join("|")})(\\.)?`, "gi");

const numberAndMeasurementRegex = new RegExp(
  `^([\\d\\s½¼¾⅓⅔⅕⅖⅗⅘⅙⅛⅜⅝⅞/]+([-–]|to)?(?:${MEASUREMENT_OPTION.join(
    "|"
  )})?(\\.)?s?\\s+(plus|minus)?)+`,
  "gi"
);

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

/* Given an ingredient name, find the closest match in the ingredients map */
export const findClosestKey = (
  ingredientName: string
): Measurement | undefined => {
  // Remove anything after comma, that's usually about temperature or other info
  const ingredientNameWithoutComma = ingredientName.split(",")[0];
  const searchTerm =
    ingredientNameWithoutComma in aliases
      ? aliases[ingredientNameWithoutComma]
      : ingredientNameWithoutComma;

  const closestIngredient = fuse.search(searchTerm);
  if (closestIngredient.length > 0) {
    const closestKey = closestIngredient[0].item;
    console.log("CLOSEST KEY", closestKey, " to ", ingredientName);
    return ingredientsWithMeasurements[closestKey];
  } else {
    console.error(`No match found for '${searchTerm}!'`);
    return undefined;
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
    // Unit matches what we have in measurement
    if (measurements[unitPart] !== undefined) {
      return amountAsNumber * measurements[unitPart]!;
      // See if we can convert the unit - only for cups, tablespoons, and teaspoons
    } else if (isConversionRateKey(unitPart)) {
      for (const measurementOption in measurements) {
        if (isConversionRateKey(measurementOption)) {
          let result =
            amountAsNumber *
            measurements[measurementOption]! *
            conversionRates[measurementOption][unitPart]!;
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
export const getGramsForMeasurement = (
  ingredientName: string,
  numberAndMeasurement: string,
  measurements: Measurement
): string => {
  // Do we need to add or subtract anything?
  const plusOrMinus = numberAndMeasurement.match(/(.*)\s(plus|minus)(.*)/i);
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
      return "";
    }

    if (plusOrMinus[2] === "plus") {
      return `${grams1 + grams2} g`;
    } else {
      return `${grams1 - grams2} g`;
    }
  }

  // Get the amount
  const quantity = getQuantityFrmoMeasurement(numberAndMeasurement);
  if (!quantity) return "";

  // Is the amount a range?
  const possibleRange = quantity.split(/[-–+]/g);

  if (possibleRange.length === 1) {
    return `${getGramsForSingleMeasurement(
      ingredientName,
      numberAndMeasurement,
      measurements,
      quantity
    )} g`;
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

  return "";
};

/* Given a measurement in ounces, convert it into grams with some easy multiplication */
export const getGramsFromOunces = (numberAndMeasurement: string): string => {
  // Get the amount
  const quantity = getQuantityFrmoMeasurement(numberAndMeasurement);
  if (!quantity) return "";

  // Is the amount a range?
  const possibleRange = quantity.split(/[-–+]/g);

  if (possibleRange.length === 1) {
    return `${numericQuantity(possibleRange[0].trim()) * 28} g`;
  } else if (possibleRange.length === 2) {
    return `${possibleRange
      .map((x) => numericQuantity(x.trim()) * 28)
      .join(" g - ")} g`;
  } else {
    console.error(
      `Had a range of 3 or more in ${numberAndMeasurement}, not sure how to handle`
    );
  }

  return "";
};
