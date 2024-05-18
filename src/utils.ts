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
  METRIC_QUANTITY_1,
  METRIC_QUANTITY_2,
  METRIC_UNIT,
  RANGE_QUANTITY_1,
  RANGE_QUANTITY_2,
  RANGE_UNIT,
  SIMPLE_QUANTITY,
  SIMPLE_UNIT,
  eggLineRegex,
  ingredientWithOrOptions,
  numbersAtBeginningOfLineRegex,
  ouncesOrGramsInParenthesesRegex,
  rangeQuantityAndUnitLineRegex,
  simpleQuantityAndUnitLineRegex,
  twoQuantitiesAndUnitsWithMathLineRegex,
} from "./regex";
import {
  IngredientConversionInformation,
  Measurement,
  MeasurementOption,
  ParsedLine,
  isConversionRateKey,
  isMeasurementOption,
  isMetricUnit,
} from "./types";

/* Convert unit abbreviations to their full name */
export const standardizeUnit = (unit: MeasurementOption): MeasurementOption => {
  if (unit === "tbsp") return "tablespoon";
  else if (unit === "tsp") return "teaspoon";

  return unit;
};

/* Given a line from a recipe, identify the kind of quantity and unit it is and separate the ingredient name */
export const parseRecipeLine = (recipeLine: string): ParsedLine | undefined => {
  // Test out possible options for quantity and unit
  let result: Partial<ParsedLine> = {};

  // Get rid of some common words that don't matter and throw off matching
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
        quantityType: "extraMetric",
      };
      ingredientName = ingredientName.replace(ouncesOrGrams[0], "").trim();
    }

    result.ingredientName = ingredientName;

    return result as ParsedLine;
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
  const lowerCaseIngredientName = ingredientName
    .toLowerCase()
    .replace(/cold/g, " ")
    .replace(/room temperature/g, " ")
    .replace(/unsweetened/g, " ")
    .replace(/unbleached/g, " ")
    .replace(/packed/g, " ")
    .replace(/,/g, " ")
    .trim();

  const searchTerm =
    lowerCaseIngredientName in ingredientAliases
      ? ingredientAliases[lowerCaseIngredientName]
      : lowerCaseIngredientName;

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
    console.error(`No match found for '${searchTerm}'`, potentialMatches);

    // TODO: better logic to avoid nut butters?
    // Butter often has qualifiers, so just see it it contains that word
    if (searchTerm.includes("butter")) {
      return ingredientsFuse.search("butter")[0];
    }

    return undefined;
  }
};

/* Given an ingredient name, find the closest match in the ingredients map. This could include an or */
export const findClosestKey = (ingredientName: string): string | undefined => {
  // Remove anything in parentheses or after comma, that's usually about temperature or other info
  const ingredientWithoutParentheses = ingredientName.replace(
    / *\([^)]*\) */g,
    ""
  );
  // Are the ingredients or-ed? If so, compare
  const orIngredients = ingredientWithoutParentheses.match(
    ingredientWithOrOptions
  );

  if (!orIngredients) {
    // Only 1 ingredient listed
    const closestKey = findClosestKeySingle(ingredientWithoutParentheses);
    return closestKey ? closestKey.item : undefined;
  } else {
    // Figure out closest key for both
    const closestKey1 = findClosestKeySingle(orIngredients[1]);
    const closestKey2 = findClosestKeySingle(orIngredients[2]);

    if (closestKey1 && closestKey2) {
      // Score shouldn't be undefined, but just in case
      if (closestKey1.score === undefined) return closestKey2.item;
      else if (closestKey2.score === undefined) return closestKey1.item;
      // Return the one with the lower score
      else
        return closestKey1.score < closestKey2.score
          ? closestKey1.item
          : closestKey2.item;
    } else if (closestKey1) {
      // Only the first ingredient had a match
      return closestKey1.item;
    } else if (closestKey2) {
      // Only the second ingredient had a match
      return closestKey2.item;
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
  ingredientInfo: ParsedLine,
  measurementInfo: Measurement
): number | number[] | undefined => {
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
      return undefined;
    }

    if (
      ingredientInfo.regexMatch[MATH_OPERATOR] === "plus" ||
      ingredientInfo.regexMatch[MATH_OPERATOR] === "+"
    ) {
      return grams1 + grams2;
    } else {
      return grams1 - grams2;
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
      return undefined;
    }

    return [grams1, grams2];
  }

  if (ingredientInfo.quantityType === "simple") {
    const result = getGramsForSingleMeasurement(
      ingredientInfo.regexMatch[SIMPLE_QUANTITY],
      ingredientInfo.regexMatch[SIMPLE_UNIT],
      measurementInfo
    );

    if (!result) {
      console.error(`Couldn't find grams for ${ingredientInfo}`);
      return undefined;
    }

    return result;
  }

  // backup
  return undefined;
};

const convertOuncesToGrams = (ounces: number): number =>
  +(ounces * 28.349523125).toFixed(2);

/* Given a measurement in ounces, convert it into grams with some easy multiplication */
export const getGramsFromMetricMeasurement = (
  metricMeasurement: RegExpMatchArray,
  isOunces: boolean,
  isRange: boolean
): number | number[] => {
  if (isRange) {
    const quantities = [
      metricMeasurement[METRIC_QUANTITY_1],
      metricMeasurement[METRIC_QUANTITY_2],
    ];
    return isOunces
      ? quantities.map((x) => convertOuncesToGrams(numericQuantity(x.trim())))
      : quantities.map((x) => numericQuantity(x.trim()));
  }

  return isOunces
    ? convertOuncesToGrams(numericQuantity(metricMeasurement[SIMPLE_QUANTITY]))
    : numericQuantity(metricMeasurement[SIMPLE_QUANTITY]);
};

const multiplyByScale = (value: number, scale: number) => {
  return +(value * scale).toFixed(2);
};

export const getConvertedLine = (
  ingredientConversionInfo: IngredientConversionInformation,
  scale: number,
  keepTeaspoons: boolean,
  keepEggs: boolean
): string => {
  const unit = ingredientConversionInfo.parsedLine
    ? getUnit(ingredientConversionInfo.parsedLine)
    : undefined;
  const metricUnit = ingredientConversionInfo.metricUnit
    ? ingredientConversionInfo.metricUnit
    : "g";

  // Couldn't parse the string
  if (
    !ingredientConversionInfo.measurementInGrams ||
    (keepTeaspoons && (unit === "teaspoon" || unit === "tsp")) ||
    (keepEggs &&
      (ingredientConversionInfo.closestMeasurementKey === "Egg (fresh)" ||
        ingredientConversionInfo.closestMeasurementKey ===
          "Egg white (fresh)" ||
        ingredientConversionInfo.closestMeasurementKey === "Egg yolk (fresh)"))
  ) {
    // Try to scale any numbers at the beginning of a line that wasn't parsed
    const numberMatch = ingredientConversionInfo.originalLine.match(
      numbersAtBeginningOfLineRegex
    );

    if (!numberMatch) return ingredientConversionInfo.originalLine;

    return `${multiplyByScale(
      numericQuantity(numberMatch[RANGE_QUANTITY_1]),
      scale
    )} ${
      numberMatch[RANGE_QUANTITY_2]
        ? `- ${multiplyByScale(
            numericQuantity(numberMatch[RANGE_QUANTITY_2]),
            scale
          )} `
        : ""
    }${numberMatch[RANGE_UNIT]}`;
  }

  // Could parse and the measurement was a range
  if (ingredientConversionInfo.measurementInGrams instanceof Array) {
    return `${multiplyByScale(
      ingredientConversionInfo.measurementInGrams[0],
      scale
    )} - ${multiplyByScale(
      ingredientConversionInfo.measurementInGrams[1],
      scale
    )} ${metricUnit} ${ingredientConversionInfo.parsedLine?.ingredientName}`;
  }

  // Could parse and the measurement was simple
  return `${multiplyByScale(
    ingredientConversionInfo.measurementInGrams,
    scale
  )} ${metricUnit} ${ingredientConversionInfo.parsedLine?.ingredientName}`;
};

export const getUnit: (parsedLine: ParsedLine) => string = (parsedLine) => {
  switch (parsedLine.quantityType) {
    case "simple":
      return parsedLine.regexMatch[SIMPLE_UNIT];
    case "range":
      return parsedLine.regexMatch[RANGE_UNIT];
    case "extraMetric":
      return parsedLine.regexMatch[METRIC_UNIT];
    default:
      console.error("no match");
      return "";
  }
};

export const convertRecipe = (
  recipeText: string
): IngredientConversionInformation[] => {
  const conversion: IngredientConversionInformation[] = [];
  for (const line of recipeText.split("\n")) {
    if (line.length === 0) continue;

    const parsedLine = parseRecipeLine(line);
    console.log(recipeText, parsedLine);

    if (!parsedLine) {
      conversion.push({
        originalLine: line,
      });
      continue;
    }

    const closestMeasurementKey = findClosestKey(parsedLine.ingredientName);

    if (!closestMeasurementKey) {
      conversion.push({
        originalLine: line,
        parsedLine: parsedLine,
        measurementInGrams:
          parsedLine.quantityType === "extraMetric"
            ? parseInt(parsedLine.regexMatch[METRIC_QUANTITY_1])
            : undefined,
        metricUnit: parsedLine.regexMatch[METRIC_UNIT],
      });
    } else {
      // If given ounces or grams, just convert quickly
      if (parsedLine.isMetric) {
        const originalUnit = getUnit(parsedLine).toLowerCase();
        const isOunces = originalUnit === "oz" || originalUnit === "ounce";

        conversion.push({
          originalLine: line,
          parsedLine: parsedLine,
          closestMeasurementKey,
          measurementInGrams: getGramsFromMetricMeasurement(
            parsedLine.regexMatch,
            isOunces,
            parsedLine.quantityType === "range"
          ),
          metricUnit:
            originalUnit === "milliliter" || originalUnit === "ml" ? "ml" : "g",
        });
      } else {
        conversion.push({
          originalLine: line,
          parsedLine: parsedLine,
          closestMeasurementKey,
          measurementInGrams: getGramsForCompleteMeasurement(
            parsedLine,
            ingredientsWithMeasurements[closestMeasurementKey]
          ),
        });
      }
    }
  }

  return conversion;
};
