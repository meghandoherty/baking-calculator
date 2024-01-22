import { FuseResult } from "fuse.js";
import { numericQuantity } from "numeric-quantity";
import {
  conversionRates,
  ingredientAliases,
  ingredientsFuse,
} from "./constants";
import { ingredientsWithMeasurements } from "./ingredients";
import {
  EGG_SIZE,
  MATH_OPERATOR,
  MATH_QUANTITY_1,
  MATH_QUANTITY_2,
  MATH_UNIT_1,
  MATH_UNIT_2,
  METRIC_AMOUNT,
  METRIC_UNIT,
  RANGE_QUANTITY_1,
  RANGE_QUANTITY_2,
  RANGE_UNIT,
  SIMPLE_QUANTITY,
  SIMPLE_UNIT,
  eggLineRegex,
  ingredientWithOrOptions,
  ouncesOrGramsInParenthesesRegex,
  rangeQuantityAndUnitLineRegex,
  simpleQuantityAndUnitLineRegex,
  twoQuantitiesAndUnitsWithMathLineRegex,
} from "./regex";
import {
  IngredientInformation,
  Measurement,
  MeasurementOption,
  isConversionRateKey,
  isMeasurementOption,
  isMetricUnit,
} from "./types";

/* Convert unit abbrevitions to their full name */
const standardizeUnit = (unit: MeasurementOption): MeasurementOption => {
  if (unit === "tbsp") return "tablespoon";
  else if (unit === "tsp") return "teaspoon";

  return unit;
};

/* Given a line from a recipe, identify the kind of quantity and unit it is and separate the ingredient name */
export const parseRecipeLine = (
  recipeLine: string
): IngredientInformation | undefined => {
  // Test out possible options for quantity and unit
  let result: Partial<IngredientInformation> = {};
  const trimmedRecipeLine = recipeLine.replace(/optional:?/i, "").trim();

  // Math quantity
  const twoQuantities = trimmedRecipeLine.match(
    twoQuantitiesAndUnitsWithMathLineRegex
  );
  if (twoQuantities) {
    result = {
      quantityType: "twoUnitsWithMath",
      regexMatch: twoQuantities,
      isMetric:
        isMetricUnit(twoQuantities[MATH_UNIT_1]) &&
        isMetricUnit(twoQuantities[MATH_UNIT_2]),
    };
  }

  // Range quantity
  if (!result.quantityType) {
    const rangeMatch = trimmedRecipeLine.match(rangeQuantityAndUnitLineRegex);
    if (rangeMatch) {
      result = {
        quantityType: "range",
        regexMatch: rangeMatch,
        isMetric: isMetricUnit(rangeMatch[RANGE_UNIT]),
      };
    }
  }

  // Simple quantity
  if (!result.quantityType) {
    const simpleMatch = trimmedRecipeLine.match(simpleQuantityAndUnitLineRegex);
    if (simpleMatch) {
      result = {
        quantityType: "simple",
        regexMatch: simpleMatch,
        isMetric: isMetricUnit(simpleMatch[SIMPLE_UNIT]),
      };
    }
  }

  if (result?.regexMatch) {
    let ingredientName = trimmedRecipeLine
      .substring(result.regexMatch[0].length)
      .trim();

    if (!ingredientName) {
      console.error(`Unable to parse ${recipeLine} for ingredientName!`);
      return undefined;
    }

    // Check for ounce or gram information
    const ouncesOrGrams = ingredientName.match(ouncesOrGramsInParenthesesRegex);

    if (ouncesOrGrams) {
      // Just use the metric instead of storing the imperial
      result = {
        ...result,
        regexMatch: ouncesOrGrams,
        isMetric: true,
      };
      ingredientName = ingredientName.replace(ouncesOrGrams[0], "").trim();
    }

    result.ingredientName = ingredientName;

    return result as IngredientInformation;
  }

  // Special case for eggs
  const eggMatch = trimmedRecipeLine.match(eggLineRegex);
  if (eggMatch) {
    // Add large as default size
    eggMatch[EGG_SIZE] = eggMatch[EGG_SIZE] || "large";

    return {
      ingredientName: eggMatch[3],
      quantityType: "simple",
      regexMatch: eggMatch,
    };
  }

  console.error(`Unable to parse ${trimmedRecipeLine} for quantity!`);
  return undefined;
};

/* Given an ingredient name, find the closest match in the ingredients map */
export const findClosestKeySingle = (
  ingredientName: string
): FuseResult<string> | undefined => {
  const lowerCaseIngredientName = ingredientName.toLowerCase();
  const searchTerm =
    lowerCaseIngredientName in ingredientAliases
      ? ingredientAliases[lowerCaseIngredientName]
      : ingredientName;

  const potentialMatches = ingredientsFuse.search(searchTerm);
  if (
    potentialMatches.length > 0 &&
    potentialMatches[0].score !== undefined &&
    potentialMatches[0].score < 0.6
  ) {
    console.info(
      `Match for ${searchTerm}: ${potentialMatches[0].item}`,
      potentialMatches
    );
    return potentialMatches[0];
  } else {
    console.error(`No match found for '${searchTerm}!'`, potentialMatches);
    return undefined;
  }
};

/* Given an ingredient name, find the closest match in the ingredients map. This could include an or */
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
  const orIngredients = ingredientWithoutParentheses.match(
    ingredientWithOrOptions
  );

  if (!orIngredients) {
    // Only 1 ingredient listed
    const closestKey = findClosestKeySingle(ingredientNameWithoutComma);
    return closestKey
      ? ingredientsWithMeasurements[closestKey.item]
      : undefined;
  } else {
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
  }
};

/* Given something we know is a single measurement, convert it to grams */
export const getGramsForSingleMeasurement = (
  amount: string,
  unit: string,
  measurements: Measurement
): number | undefined => {
  // Convert the string amount to a number
  // Fix any numbers that include "and" - e.g. "1 and 1/2" becomes "1 1/2"
  const amountAsNumber = numericQuantity(amount.replace(" and", ""));

  const lowerCaseUnit = unit.toLowerCase();
  if (isMeasurementOption(lowerCaseUnit)) {
    const standardizedUnit = standardizeUnit(lowerCaseUnit);
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

  // Something went wrong, return undefined
  return undefined;
};

/* Given an ingredient name and measurement, convert it to the number of grams */
export const getGramsForCompleteMeasurement = (
  ingredientInfo: IngredientInformation,
  measurementInfo: Measurement
): string => {
  // Handle measurement that needs math
  if (ingredientInfo.quantityType === "twoUnitsWithMath") {
    const grams1 = getGramsForSingleMeasurement(
      ingredientInfo.regexMatch[MATH_QUANTITY_1],
      ingredientInfo.regexMatch[MATH_UNIT_1],
      measurementInfo
    );
    const grams2 = getGramsForSingleMeasurement(
      ingredientInfo.regexMatch[MATH_QUANTITY_2],
      ingredientInfo.regexMatch[MATH_UNIT_2],
      measurementInfo
    );

    if (!grams1 || !grams2) {
      console.error(
        `Couldn't find grams for ${ingredientInfo} to add or subtract`
      );
      return ingredientInfo.regexMatch[0];
    }

    if (
      ingredientInfo.regexMatch[MATH_OPERATOR] === "plus" ||
      ingredientInfo.regexMatch[MATH_OPERATOR] === "+"
    ) {
      return `${grams1 + grams2} g`;
    } else {
      return `${grams1 - grams2} g`;
    }
  }

  // Handle range measurement
  if (ingredientInfo.quantityType === "range") {
    const grams1 = getGramsForSingleMeasurement(
      ingredientInfo.regexMatch[RANGE_QUANTITY_1],
      ingredientInfo.regexMatch[RANGE_UNIT],
      measurementInfo
    );
    const grams2 = getGramsForSingleMeasurement(
      ingredientInfo.regexMatch[RANGE_QUANTITY_2],
      ingredientInfo.regexMatch[RANGE_UNIT],
      measurementInfo
    );

    if (!grams1 || !grams2) {
      console.error(`Couldn't find grams for ${ingredientInfo} for range`);
      return ingredientInfo.regexMatch[0];
    }

    return `${grams1} - ${grams2} g`;
  }

  if (ingredientInfo.quantityType === "simple") {
    const result = getGramsForSingleMeasurement(
      ingredientInfo.regexMatch[SIMPLE_QUANTITY],
      ingredientInfo.regexMatch[SIMPLE_UNIT],
      measurementInfo
    );

    if (!result) {
      console.error(`Couldn't find grams for ${ingredientInfo}`);
      return ingredientInfo.regexMatch[0];
    }

    return `${result} g`;
  }

  // backup - return the original measurement
  return ingredientInfo.regexMatch[0];
};

const convertOuncesToGrams = (ounces: number): number =>
  +(ounces * 28.349523125).toFixed(2);

/* Given a measurement in ounces, convert it into grams with some easy multiplication */
export const getGramsFromMetricMeasurement = (
  metricMeasurement: RegExpMatchArray
): string => {
  const isOunces =
    metricMeasurement[METRIC_UNIT].toLowerCase() === "oz" ||
    metricMeasurement[METRIC_UNIT].toLowerCase() === "ounce";
  // Is the amount a range?
  const possibleRange = metricMeasurement[METRIC_AMOUNT].split(/[-–+]/g);

  if (possibleRange.length === 1) {
    return isOunces
      ? `${convertOuncesToGrams(numericQuantity(possibleRange[0].trim()))} g`
      : `${numericQuantity(possibleRange[0])} ${
          metricMeasurement[METRIC_UNIT]
        }`;
  }

  return isOunces
    ? `${possibleRange
        .map((x) => convertOuncesToGrams(numericQuantity(x.trim())))
        .join(" g - ")} g`
    : `${possibleRange.map((x) => numericQuantity(x.trim())).join(" - ")} ${
        metricMeasurement[METRIC_UNIT]
      }`;
};
