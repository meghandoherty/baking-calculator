import { MEASUREMENT_OPTION } from "./types";

// TODO: Handle ors
// 113g or 1/2 cup unsalted butter at room temperature
// 80g or 1/2 cup plus 2 tablespoons all purpose flour

// example: 1, 10, 1 1/2, 1 / 2, ⅕
export const numberRegex =
  /((?:\d+)? ?(?:and )?(?:\d+ ?\/ ?\d+)|(?:\d+ ?[½¼¾⅓⅔⅕⅖⅗⅘⅙⅔¾⅛⅜⅝⅞])|(?:\d+\.\d+)|(?:\d+|[½¼¾⅓⅔⅕⅖⅗⅘⅙⅔¾⅛⅜⅝⅞]))/;

// example: 1-2, 1 – 2, 1 to 2
export const numberRangeRegex = new RegExp(
  `${numberRegex.source}\\s?(?:-|–|to)\\s?${numberRegex.source}`
);

// example: cup, cups, oz., lbs.
export const unitRegex = new RegExp(
  `(${MEASUREMENT_OPTION.join("|")})s?\\.?`,
  "i"
);

// example: 1 cup, 1 1/2 tablespoons
// result: [ "1 1/2 cups", "1 1/2", "cup" ]
export const quantityAndUnitRegex = new RegExp(
  `${numberRegex.source} ?${unitRegex.source}`
);

export const simpleQuantityAndUnitLineRegex = new RegExp(
  `^${quantityAndUnitRegex.source}(?! plus| minus| \\+)`,
  "i"
);
export const SIMPLE_QUANTITY = 1;
export const SIMPLE_UNIT = 2;

// example: 1-2 cups, 1 – 2 cups, 1 to 2 cups
// result: [ "10 - 12 oz", "10 ", "12 ", "oz" ]
export const rangeQuantityAndUnitLineRegex = new RegExp(
  `^${numberRangeRegex.source}\\s?${unitRegex.source}`,
  "i"
);
export const RANGE_QUANTITY_1 = 1;
export const RANGE_QUANTITY_2 = 2;
export const RANGE_UNIT = 3;

// example: 1 cup plus 1 tablespoon, 1 cup + 1 tablespoon
// result: [ "1 cup plus 2 tablespoon", "1", "cup", "plus", "2", "tablespoon" ]
export const twoQuantitiesAndUnitsWithMathLineRegex = new RegExp(
  `^${quantityAndUnitRegex.source} ?(plus|\\+|minus|-) ?${quantityAndUnitRegex.source}`,
  "i"
);
export const MATH_OPERATOR = 3;
export const MATH_QUANTITY_1 = 1;
export const MATH_UNIT_1 = 2;
export const MATH_QUANTITY_2 = 4;
export const MATH_UNIT_2 = 5;

// example: yogurt or sour cream
export const ingredientWithOrOptions = /(.*)\sor\s(.*)/i;

// example: (1 ounce), (10 - 12 oz), [1 gram], (10 g)
// result: [ "(140 grams)", "140", "gram" ]
// result: [ "(100 - 200 grams)", "100 - 200", "gram" ]
export const ouncesOrGramsInParenthesesRegex =
  /(?:\(|\[)(\d+(?: ?- ?\d+)?) ?(ounce|oz|gram|g|ml|milliliter)s?(?:\)|\])/;
export const METRIC_AMOUNT = 1;
export const METRIC_UNIT = 2;

// example: 1 egg, 1 large egg, 2 egg yolks
// result: [ "1 egg", "1", undefined, "egg" ]
// result: [ "2 large egg yolks", "2", "large", "egg yolk" ]
export const eggLineRegex =
  /(\d+) (large|medium|small)? ?(egg ?(?:yolk|white)?s?)/i;
export const EGG_AMOUNT = 1;
export const EGG_SIZE = 2;
export const EGG_TYPE = 3;
