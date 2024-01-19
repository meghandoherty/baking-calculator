import { describe, expect, test } from "vitest";
import { numberRegex } from "./regex";

describe("numberRegex", () => {
  test("should match integers", () => {
    const input = "42";
    expect(input.match(numberRegex)?.[0]).toEqual("42");
  });

  test("should match decimals", () => {
    const input = "3.14";
    expect(input.match(numberRegex)?.[0]).toEqual("3.14");
  });

  test("should match fractions", () => {
    const input = "½";
    expect(input.match(numberRegex)?.[0]).toEqual("½");
  });

  test("should match mixed fractions", () => {
    const input = "2⅔";
    expect(input.match(numberRegex)?.[0]).toEqual("2⅔");
  });

  test("should match fractions wtesth whtestespace", () => {
    const input = "1 ¼";
    expect(input.match(numberRegex)?.[0]).toEqual("1 ¼");
  });
});
