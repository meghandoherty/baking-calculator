export type IngredientsAndMeasurements = {
  [ingredient: string]: Measurement;
};

export type Measurement = {
  [key in MeasurementOptions]?: number;
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
] as const;

export type MeasurementOptions = (typeof MEASUREMENT_OPTION)[number];

export const isMeasurementOption = (
  value: string
): value is MeasurementOptions => {
  return MEASUREMENT_OPTION.includes(value as MeasurementOptions);
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
