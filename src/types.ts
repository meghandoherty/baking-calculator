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
  "gram",
  "g",
  "ml",
  "milliliter",
  // Used for eggs, fruit
  "large",
  "medium",
  "small",
  // butter
  "stick",
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
  quantityType: "simple" | "range" | "twoUnitsWithMath" | "extraMetric";
  regexMatch: RegExpMatchArray;
  isMetric?: boolean;
};

export type IngredientConversionInformation = {
  originalLine: string;
  parsedLine?: ParsedLine;
  closestMeasurementKey?: string;
  measurementInGrams?: number | number[];
  metricUnit?: string; // only used if metric provided in originalLine
};

export interface IngredientConversionInformationForShoppingList
  extends IngredientConversionInformation {
  customMeasurementUnit?: string;
  customMeasurementQuantity?: string;
  useCustomMeasurement: boolean;
}

export type RecipeForShoppingList = {
  recipeName: string;
  ingredients: Record<string, AggregatedIngredientInfo>;
  miscIngredients: string[];
};

export type AggregatedIngredientInfo = {
  totalQuantity: number;
  lines: string[];
};
