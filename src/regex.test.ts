import { describe, expect, test } from "vitest";
import {
  EGG_AMOUNT,
  EGG_SIZE,
  EGG_TYPE,
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
  numberRangeRegex,
  numberRegex,
  ouncesOrGramsInParenthesesRegex,
  quantityAndUnitRegex,
  rangeQuantityAndUnitLineRegex,
  simpleQuantityAndUnitLineRegex,
  twoQuantitiesAndUnitsWithMathLineRegex,
} from "./regex";

describe("simple regexes", () => {
  describe("numberRegex", () => {
    test("should match integers", () => {
      expect("42".match(numberRegex)?.[0]).toEqual("42");
    });

    test("should match decimals", () => {
      expect("1.4".match(numberRegex)?.[0]).toEqual("1.4");
    });

    test("should match fractions", () => {
      expect("½".match(numberRegex)?.[0]).toEqual("½");
      expect("1 / 2".match(numberRegex)?.[0]).toEqual("1 / 2");
      expect("1/2".match(numberRegex)?.[0]).toEqual("1/2");
    });

    test("should match mixed fractions", () => {
      expect("2⅔".match(numberRegex)?.[0]).toEqual("2⅔");
      expect("1 1 / 2".match(numberRegex)?.[0]).toEqual("1 1 / 2");
      expect("1 1/2".match(numberRegex)?.[0]).toEqual("1 1/2");
    });

    test("should not match invalid input", () => {
      expect("1.5/4".match(numberRangeRegex)).toBeNull();
      expect("1.5.2".match(numberRangeRegex)).toBeNull();
      expect("1/5/2".match(numberRangeRegex)).toBeNull();
    });
  });

  describe("numberRangeRegex", () => {
    test("should match range with dash symbol", () => {
      expect("10 - 12".match(numberRangeRegex)?.[0]).toEqual("10 - 12");
    });

    test("should match range with other dash symbol", () => {
      expect("1.5 – 2".match(numberRangeRegex)?.[0]).toEqual("1.5 – 2");
    });

    test("should match range with the word 'to'", () => {
      expect("1/2 to 3/4".match(numberRangeRegex)?.[0]).toEqual("1/2 to 3/4");
    });

    test("should not match invalid input", () => {
      expect("1 cup - 2 tablespoons".match(numberRangeRegex)).toBeNull();
    });
  });

  describe("quantityAndUnitRegex", () => {
    test.each([
      "1 packet",
      "2 1/2 cups",
      "3.5 grams",
      "½ teaspoon",
      "1 and 1/3 cup",
    ])("should match simple quantity and unit: %s", (input) => {
      expect(input.match(quantityAndUnitRegex)?.[0]).toEqual(input);
    });

    test.each(["1 kgs", "1.5", "cup"])(
      "should not match simple quantity and unit regex: %s",
      (input) => {
        expect(input.match(quantityAndUnitRegex)).toBeNull();
      }
    );
  });

  describe("ingredientWithOrOptions", () => {
    test("should match both ingredient with an or", () => {
      const ingredient1 = "yogurt";
      const ingredient2 = "sour cream";
      const input = `${ingredient1} or ${ingredient2}`;

      const result = input.match(ingredientWithOrOptions);

      expect(result).not.toBeNull();
      expect(result).toHaveLength(3);
      expect(result![0]).toEqual(input);
      expect(result![1]).toEqual(ingredient1);
      expect(result![2]).toEqual(ingredient2);
    });
  });

  describe("ouncesOrGramsInParenthesesRegex", () => {
    test("should match ounces or grams in parentheses of various formats", () => {
      expect(
        "1 cup (10 oz) flour".match(ouncesOrGramsInParenthesesRegex)?.[0]
      ).toEqual("(10 oz)");
      expect(
        "1 cup (120 grams) flour".match(ouncesOrGramsInParenthesesRegex)?.[0]
      ).toEqual("(120 grams)");
      expect(
        "1 cup flour [120 g]".match(ouncesOrGramsInParenthesesRegex)?.[0]
      ).toEqual("[120 g]");
      expect(
        "6 Tablespoons flour (63g)".match(ouncesOrGramsInParenthesesRegex)?.[0]
      ).toEqual("(63g)");
      expect(
        "1/3 cup (80ml) whole milk".match(ouncesOrGramsInParenthesesRegex)?.[0]
      ).toEqual("(80ml)");
    });

    test("should separate the parts of a match into an array", () => {
      const result = "1 cup flour [120 g]".match(
        ouncesOrGramsInParenthesesRegex
      );
      expect(result).not.toBeNull();
      expect(result).toHaveLength(3);
      expect(result![0]).toEqual("[120 g]");
      expect(result![METRIC_AMOUNT]).toEqual("120");
      expect(result![METRIC_UNIT]).toEqual("g");
    });
  });
});

describe("line regexes", () => {
  describe("simpleQuantityAndUnitLineRegex", () => {
    test("should match simple quantity and unit line: 1 cup flour", () => {
      expect("1 cup".match(simpleQuantityAndUnitLineRegex)?.[0]).toEqual(
        "1 cup"
      );
    });

    test("should separate the parts of a match into an array", () => {
      const result = "1 Tbsp".match(simpleQuantityAndUnitLineRegex);
      expect(result).not.toBeNull();
      expect(result).toHaveLength(3);
      expect(result![0]).toEqual("1 Tbsp");
      expect(result![SIMPLE_QUANTITY]).toEqual("1");
      expect(result![SIMPLE_UNIT]).toEqual("Tbsp");
    });

    test.each(["10 - 12 oz chocolate", "1 cup plus 2 tablespoons sugar"])(
      "should not match other patterns: %s",
      (input) => {
        expect(input.match(simpleQuantityAndUnitLineRegex)).toBeNull();
      }
    );
  });

  describe("rangeQuantityAndUnitLineRegex", () => {
    test.each(["1-2 packets", "2 - 2 1/2 cups", "3 to 4 grams"])(
      "should match simple quantity and unit: %s",
      (input) => {
        expect(input.match(rangeQuantityAndUnitLineRegex)?.[0]).toEqual(input);
      }
    );

    test("should separate the parts of a match into an array", () => {
      const result = "1 - 2 cups".match(rangeQuantityAndUnitLineRegex);
      expect(result).not.toBeNull();
      expect(result).toHaveLength(4);
      expect(result![0]).toEqual("1 - 2 cups");
      expect(result![RANGE_QUANTITY_1]).toEqual("1");
      expect(result![RANGE_QUANTITY_2]).toEqual("2");
      expect(result![RANGE_UNIT]).toEqual("cup");
    });

    test.each(["1 cup flour", "1 cup plus 2 tablespoons sugar"])(
      "should not match other patterns: %s",
      (input) => {
        expect(input.match(rangeQuantityAndUnitLineRegex)).toBeNull();
      }
    );
  });

  describe("twoQuantitiesAndUnitsWithMathLineRegex", () => {
    test.each([
      "1 cup + 1 tablespoon",
      "1/4 cup plus 1 teaspoon",
      "1 cup minus 3 tablespoon",
    ])("should match simple quantity and unit: %s", (input) => {
      expect(input.match(twoQuantitiesAndUnitsWithMathLineRegex)?.[0]).toEqual(
        input
      );
    });

    test("should separate the parts of a match into an array", () => {
      const result = "1 cup + 3 tablespoons".match(
        twoQuantitiesAndUnitsWithMathLineRegex
      );
      expect(result).not.toBeNull();
      expect(result).toHaveLength(6);
      expect(result![0]).toEqual("1 cup + 3 tablespoons");
      expect(result![MATH_QUANTITY_1]).toEqual("1");
      expect(result![MATH_QUANTITY_2]).toEqual("3");
      expect(result![MATH_UNIT_1]).toEqual("cup");
      expect(result![MATH_UNIT_2]).toEqual("tablespoon");
      expect(result![MATH_OPERATOR]).toEqual("+");
    });

    test.each(["1 cup flour", "10 - 12 oz chocolate"])(
      "should not match other patterns: %s",
      (input) => {
        expect(input.match(twoQuantitiesAndUnitsWithMathLineRegex)).toBeNull();
      }
    );
  });

  describe("eggLineRegex", () => {
    test.each(["1 large egg", "2 egg yolks", "4 small egg whites"])(
      "should match simple quantity and unit: %s",
      (input) => {
        expect(input.match(eggLineRegex)?.[0]).toEqual(input);
      }
    );

    test("should separate the parts of a match into an array", () => {
      const result = "1 large egg".match(eggLineRegex);
      expect(result).not.toBeNull();
      expect(result).toHaveLength(4);
      expect(result![0]).toEqual("1 large egg");
      expect(result![EGG_AMOUNT]).toEqual("1");
      expect(result![EGG_SIZE]).toEqual("large");
      expect(result![EGG_TYPE]).toEqual("egg");

      const result2 = "2 egg yolks".match(eggLineRegex);
      expect(result2).not.toBeNull();
      expect(result2).toHaveLength(4);
      expect(result2![0]).toEqual("2 egg yolks");
      expect(result2![EGG_AMOUNT]).toEqual("2");
      expect(result2![EGG_SIZE]).toBeUndefined();
      expect(result2![EGG_TYPE]).toEqual("egg yolks");
    });
  });
});
