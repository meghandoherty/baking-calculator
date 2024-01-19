import { MEASUREMENT_OPTION } from "./types";

// example: 1, 10, 1 1/2, 1 / 2, ⅕
export const numberRegex = /([\d½¼¾⅓⅔⅕⅖⅗⅘⅙⅔¾⅛⅜⅝⅞/\s]+)/;

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
export const simpleQuantityAndUnitRegex = new RegExp(
  `${numberRegex.source}\\s${unitRegex.source}`
);
export const SIMPLE_QUANTITY = 1;
export const SIMPLE_UNIT = 2;

// example: 1-2 cups, 1 – 2 cups, 1 to 2 cups
// result: [ "10 - 12 oz", "10 ", "12 ", "oz" ]
export const rangeQuantityAndUnitRegex = new RegExp(
  `${numberRangeRegex.source}\\s?${unitRegex.source}`
);
export const RANGE_QUANTITY_1 = 1;
export const RANGE_QUANTITY_2 = 2;
export const RANGE_UNIT = 3;

// example: 1 cup plus 1 tablespoon, 1 cup + 1 tablespoon
// result: [ "1 cup plus 2 tablespoon", "1", "cup", "plus", "2", "tablespoon" ]
export const twoQuantitiesAndUnitsWithMathRegex = new RegExp(
  `${simpleQuantityAndUnitRegex.source} ?(plus|\\+|minus|-) ?${simpleQuantityAndUnitRegex.source}`
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
  /(?:\(|\[)(\d+(?: ?- ?\d+)?) (ounce|oz|gram|g)s?(?:\)|\])/;
export const METRIC_AMOUNT = 1;
export const METRIC_UNIT = 2;

// example: 1 egg, 1 large egg, 2 egg yolks
// result: [ "1 egg", "1", undefined, "egg" ]
// result: [ "2 large egg yolks", "2", "large", "egg yolk" ]
export const eggRegex = /(\d+) (large|medium|small)? ?(egg ?(?:yolk|white)?)/i;
export const EGG_AMOUNT = 1;
export const EGG_SIZE = 2;
export const EGG_TYPE = 3;
