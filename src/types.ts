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

// TOOD: improve type?
export type ConversionRate = {
  [From in ConversionRateKey]: {
    [To in ConversionRateKey]?: number;
  };
};

export type IngredientInformation = {
  ingredientName: string;
  quantityType: "simple" | "range" | "twoUnitsWithMath";
  regexMatch: RegExpMatchArray;
};
