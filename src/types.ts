export type IngredientsAndMeasurements = {
  [ingredient: string]: Measurement;
};

export type Measurement = {
  [key in MeasurementOption]?: number;
};

export const MEASUREMENT_OPTION = [
  "packet",
  "cup",
  "teaspoon",
  "tsp",
  "tablespoon",
  "tbsp",
  "oz",
  "ounce",
  "lb",
  "pound",
  "large", // Used for eggs only
  "gram",
  "g",
  "ml",
  "milliliter",
] as const;

export type MeasurementOption = (typeof MEASUREMENT_OPTION)[number];

export const isMeasurementOption = (
  value: string
): value is MeasurementOption => {
  return MEASUREMENT_OPTION.includes(value as MeasurementOption);
};

type ConversionRateKey = "cup" | "tablespoon" | "teaspoon";

export const isConversionRateKey = (
  value: string
): value is ConversionRateKey => {
  return value === "cup" || value === "tablespoon" || value === "teaspoon";
};

export const isMetricUnit = (value: string): boolean =>
  value === "gram" ||
  value === "g" ||
  value === "ounce" ||
  value === "oz" ||
  value === "ml" ||
  value === "milliliter";

// TOOD: improve type?
export type ConversionRate = {
  [From in ConversionRateKey]: {
    [To in ConversionRateKey]?: number;
  };
};

export type ParsedLine = {
  ingredientName: string;
  quantityType: "simple" | "range" | "twoUnitsWithMath";
  regexMatch: RegExpMatchArray;
  isMetric?: boolean;
};

export type IngredientConversionInformation = {
  originalLine: string;
  parsedLine?: ParsedLine;
  closestMeasurementKey?: string;
  newLine: string;
};
