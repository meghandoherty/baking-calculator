import { afterAll, describe, expect, test, vi } from "vitest";
import { ingredientsWithMeasurements } from "./ingredients";
import {
  findClosestKey,
  findClosestKeySingle,
  getGramsForCompleteMeasurement,
  getGramsForSingleMeasurement,
  parseRecipeLine,
  standardizeUnit,
} from "./utils";

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

    test.each(["1 water", "10 cookies", "cup flour"])(
      "should return undefined if a line can't be parsed: %s",
      (input) => {
        const consoleMock = vi
          .spyOn(console, "error")
          .mockImplementation(() => undefined);

        expect(parseRecipeLine(input)).toBeUndefined();
        expect(consoleMock).toHaveBeenCalledOnce();
        expect(consoleMock).toHaveBeenLastCalledWith(
          `Unable to parse ${input} for quantity!`
        );

        consoleMock.mockReset();
      }
    );
  });

  describe("findClosestKeySingle and findClosestKey", () => {
    afterAll(() => {
      vi.resetAllMocks();
    });

    test("should return the closest key object", () => {
      vi.spyOn(console, "info").mockImplementation(() => undefined);

      expect(findClosestKeySingle("cold butter")).toEqual(
        expect.objectContaining({ item: "Butter" })
      );
      expect(findClosestKeySingle("unbleached flour")).toEqual(
        expect.objectContaining({ item: "All-Purpose Flour" })
      );
      expect(findClosestKeySingle("unsweetened cocoa powder")).toEqual(
        expect.objectContaining({ item: "Cocoa Powder (unsweetened)" })
      );
    });

    test("if no match should return undefined and log error", () => {
      const consoleMock = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);

      expect(findClosestKeySingle("nomatch1234")).toBeUndefined();
      expect(consoleMock).toHaveBeenCalledOnce();
      expect(consoleMock).toHaveBeenLastCalledWith(
        "No match found for 'nomatch1234'",
        []
      );
    });

    test("should return the closest key string for one ingredient", () => {
      vi.spyOn(console, "info").mockImplementation(() => undefined);

      expect(findClosestKey("cold butter")).toEqual("Butter");
      expect(findClosestKey("unbleached flour")).toEqual("All-Purpose Flour");
      expect(findClosestKey("unsweetened cocoa powder")).toEqual(
        "Cocoa Powder (unsweetened)"
      );
    });

    test("should return the closest key string for 2 ingredients", () => {
      vi.spyOn(console, "info").mockImplementation(() => undefined);

      expect(findClosestKey("greek yogurt or sour cream")).toEqual(
        "Sour cream"
      );
    });

    test("if no match should return undefined and log error", () => {
      const consoleMock = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);

      expect(findClosestKey("nomatch1234")).toBeUndefined();
      expect(consoleMock).toHaveBeenCalledOnce();
      expect(consoleMock).toHaveBeenLastCalledWith(
        "No match found for 'nomatch1234'",
        []
      );
    });
  });

  describe("getGramsForSingleMeasurement", () => {
    test("should fix any quantities that have the word 'and' in them", () => {
      expect(
        getGramsForSingleMeasurement(
          "1 and 1/2",
          "cup",
          ingredientsWithMeasurements["All-Purpose Flour"]
        )
      ).toEqual(180);
    });

    test("should return the correct grams for a single measurement that matches map", () => {
      expect(
        getGramsForSingleMeasurement(
          "1",
          "cup",
          ingredientsWithMeasurements["All-Purpose Flour"]
        )
      ).toEqual(120);
    });

    test("should return the correct grams for a single measurement that we can convert", () => {
      expect(
        getGramsForSingleMeasurement(
          "1",
          "tablespoon",
          ingredientsWithMeasurements["All-Purpose Flour"] // In cups
        )
      ).toEqual(7.5);

      expect(
        getGramsForSingleMeasurement(
          "1/2",
          "cup",
          ingredientsWithMeasurements["Honey"] // In tablespoons
        )
      ).toEqual(168);
    });

    test("should return undefined if the unit isn't valid or doesn't match the map and can't be converted", () => {
      expect(
        getGramsForSingleMeasurement(
          "1",
          "box",
          ingredientsWithMeasurements["Butter"]
        )
      ).toBeUndefined();

      expect(
        getGramsForSingleMeasurement(
          "1",
          "packet",
          ingredientsWithMeasurements["Honey"]
        )
      ).toBeUndefined();
    });
  });

  describe("getGramsForCompleteMeasurement", () => {
    test("should return the correct grams for a measurement of two units being added", () => {
      expect(
        getGramsForCompleteMeasurement(
          {
            ingredientName: "All-Purpose Flour",
            quantityType: "twoUnitsWithMath",
            regexMatch: [
              "1 cup plus 2 tablespoons",
              "1",
              "cup",
              "plus",
              "2",
              "tablespoon",
            ],
            isMetric: false,
          },
          ingredientsWithMeasurements["All-Purpose Flour"]
        )
      ).toEqual(135);
    });

    test("should return the correct grams for a measurement of two units being subtracted", () => {
      expect(
        getGramsForCompleteMeasurement(
          {
            ingredientName: "All-Purpose Flour",
            quantityType: "twoUnitsWithMath",
            regexMatch: [
              "1 cup minus 2 tablespoons",
              "1",
              "cup",
              "minus",
              "2",
              "tablespoon",
            ],
            isMetric: false,
          },
          ingredientsWithMeasurements["All-Purpose Flour"]
        )
      ).toEqual(105);
    });

    test("should return undefined for a measurement of two units being subtracted when one isn't converted to grams", () => {
      expect(
        getGramsForCompleteMeasurement(
          {
            ingredientName: "All-Purpose Flour",
            quantityType: "twoUnitsWithMath",
            regexMatch: [
              "1 cup minus 1 packet",
              "1",
              "cup",
              "minus",
              "1",
              "packet",
            ],
            isMetric: false,
          },
          ingredientsWithMeasurements["All-Purpose Flour"]
        )
      ).toBeUndefined();
    });

    test("should return the correct grams for a measurement of a range", () => {
      expect(
        getGramsForCompleteMeasurement(
          {
            ingredientName: "All-Purpose Flour",
            quantityType: "range",
            regexMatch: ["1 - 2 cups", "1", "2", "cup"],
            isMetric: false,
          },
          ingredientsWithMeasurements["All-Purpose Flour"]
        )
      ).toEqual([120, 240]);
    });

    test("should return undefined for a measurement of a range that can't be converted", () => {
      expect(
        getGramsForCompleteMeasurement(
          {
            ingredientName: "Honey",
            quantityType: "range",
            regexMatch: ["1 - 2 packets", "1", "2", "packet"],
            isMetric: false,
          },
          ingredientsWithMeasurements["Honey"]
        )
      ).toBeUndefined();
    });

    test("should return the correct grams for a simple measurement", () => {
      expect(
        getGramsForCompleteMeasurement(
          {
            ingredientName: "All-Purpose Flour",
            quantityType: "simple",
            regexMatch: ["1 cup", "1", "cup"],
            isMetric: false,
          },
          ingredientsWithMeasurements["All-Purpose Flour"]
        )
      ).toEqual(120);
    });

    test("should return undefined for a simple measurement that can't be converted", () => {
      expect(
        getGramsForCompleteMeasurement(
          {
            ingredientName: "All-Purpose Flour",
            quantityType: "simple",
            regexMatch: ["1 packet", "1", "packet"],
            isMetric: false,
          },
          ingredientsWithMeasurements["All-Purpose Flour"]
        )
      ).toBeUndefined();
    });
  });
});
