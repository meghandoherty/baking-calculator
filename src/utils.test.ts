import { describe, expect, test } from "vitest";
import { parseRecipeLine, standardizeUnit } from "./utils";

const twoQuantitiesAdditionTestLine = "1 cup plus 2 tablespoons flour";
// const twoQuantitiesMinusTestLine = "1 cup minus 2 tablespoons flour";
const rangeQuantityTestLine = "1-2 cups granulated sugar";
const simpleQuantityTestLine = "1/2 cup chocolate chips";
const simpleQuantityWithMetricTestLine = "1 cup (120 g) flour";

const expectRegexArrayEqual = (
  arr: RegExpMatchArray,
  expected: unknown[]
): boolean =>
  arr.every((element, index) => expect(element).toEqual(expected[index]));

describe("utils", () => {
  describe("standardizeUnit", () => {
    test('should return "tablespoon" when the unit is "tbsp"', () => {
      expect(standardizeUnit("tbsp")).to.equal("tablespoon");
    });

    test('should return "teaspoon" when the unit is "tsp"', () => {
      expect(standardizeUnit("tsp")).to.equal("teaspoon");
    });

    test("should return the original unit when the unit is not teaspoon or tablespoon", () => {
      expect(standardizeUnit("cup")).to.equal("cup");
    });
  });

  describe("parseRecipeLine", () => {
    test("should return the result for two quantities and units with math", () => {
      const result = parseRecipeLine(twoQuantitiesAdditionTestLine);
      expect(result).not.toBeUndefined();
      expect(result!.quantityType).toEqual("twoUnitsWithMath");
      expect(result!.isMetric).toEqual(false);
      expect(result!.ingredientName).toEqual("flour");
      expectRegexArrayEqual(result!.regexMatch, [
        "1 cup plus 2 tablespoons",
        "1",
        "cup",
        "plus",
        "2",
        "tablespoon",
      ]);
    });

    test("should return the result for a range quantity", () => {
      const result = parseRecipeLine(rangeQuantityTestLine);
      expect(result).not.toBeUndefined();
      expect(result!.quantityType).toEqual("range");
      expect(result!.isMetric).toEqual(false);
      expect(result!.ingredientName).toEqual("granulated sugar");
      expectRegexArrayEqual(result!.regexMatch, ["1-2 cups", "1", "2", "cup"]);
    });

    test("should return the result for a simple quantity", () => {
      const result = parseRecipeLine(simpleQuantityTestLine);
      expect(result).not.toBeUndefined();
      expect(result!.quantityType).toEqual("simple");
      expect(result!.isMetric).toEqual(false);
      expect(result!.ingredientName).toEqual("chocolate chips");
      expectRegexArrayEqual(result!.regexMatch, ["1/2 cup", "1/2", "cup"]);
    });

    test("should return the metric result for a line that has it", () => {
      const result = parseRecipeLine(simpleQuantityWithMetricTestLine);
      expect(result).not.toBeUndefined();
      expect(result!.quantityType).toEqual("extraMetric");
      expect(result!.isMetric).toEqual(true);
      expect(result!.ingredientName).toEqual("flour");
      expectRegexArrayEqual(result!.regexMatch, [
        "(120 g)",
        "120",
        undefined,
        "g",
      ]);
    });

    test("should return undefined if a line can't be parsede", () => {
      expect(parseRecipeLine("1 water")).toBeUndefined();
      expect(parseRecipeLine("cup flour")).toBeUndefined();
    });
  });
});
