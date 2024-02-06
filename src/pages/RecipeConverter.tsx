import { Button, Checkbox } from "@chakra-ui/react";
import { useState } from "react";
import RecipeTable from "../components/RecipeTable";
import RecipeTextArea from "../components/RecipeTextArea";
import ScaleInput from "../components/ScaleInput";
import { ingredientsWithMeasurements } from "../ingredients";
import { IngredientConversionInformation } from "../types";
import {
  findClosestKey,
  getConvertedLine,
  getGramsForCompleteMeasurement,
  getGramsFromMetricMeasurement,
  getUnit,
  parseRecipeLine,
} from "../utils";

const RecipeConverter = () => {
  const [recipe, setRecipe] = useState("");
  const [convertedRecipe, setConvertedRecipe] = useState<
    IngredientConversionInformation[]
  >([]);
  const [scale, setScale] = useState(1);
  const [keepTeaspoons, setKeepTeaspoons] = useState(false);
  const [keepEggs, setKeepEggs] = useState(false);

  const usableScale = scale > 0 ? scale : 1;

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRecipe(e.target.value);
  };

  const onConvertRecipe = () => {
    const newConversion: IngredientConversionInformation[] = [];
    for (const line of recipe.split("\n")) {
      if (line.length === 0) continue;

      const parsedLine = parseRecipeLine(line);

      if (!parsedLine) {
        newConversion.push({
          originalLine: line,
        });
        continue;
      }

      const closestMeasurementKey = findClosestKey(parsedLine.ingredientName);

      if (!closestMeasurementKey) {
        newConversion.push({
          originalLine: line,
          parsedLine: parsedLine,
        });
      } else {
        // If given ounces or grams, just convert quickly
        if (parsedLine.isMetric) {
          const originalUnit = getUnit(parsedLine).toLowerCase();
          const isOunces = originalUnit === "oz" || originalUnit === "ounce";

          newConversion.push({
            originalLine: line,
            parsedLine: parsedLine,
            closestMeasurementKey,
            measurementInGrams: getGramsFromMetricMeasurement(
              parsedLine.regexMatch,
              isOunces,
              parsedLine.quantityType === "range"
            ),
            metricUnit:
              originalUnit === "milliliter" || originalUnit === "ml"
                ? "ml"
                : "g",
          });
        } else {
          newConversion.push({
            originalLine: line,
            parsedLine: parsedLine,
            closestMeasurementKey,
            measurementInGrams: getGramsForCompleteMeasurement(
              parsedLine,
              ingredientsWithMeasurements[closestMeasurementKey]
            ),
          });
        }
      }
    }

    setConvertedRecipe(newConversion);
  };

  return (
    <>
      <RecipeTextArea recipe={recipe} onInputChange={onInputChange} />
      <div className="controls">
        <Button onClick={onConvertRecipe} isDisabled={recipe.length === 0}>
          Convert Recipe
        </Button>
        <ScaleInput scale={scale} setScale={setScale} />
        <div className="controls-checkboxes">
          <Checkbox
            checked={keepTeaspoons}
            onChange={(e) => setKeepTeaspoons(e.target.checked)}
          >
            Don't Convert Teaspoons
          </Checkbox>
          <Checkbox
            checked={keepEggs}
            onChange={(e) => setKeepEggs(e.target.checked)}
          >
            Don't Convert Eggs
          </Checkbox>
        </div>
      </div>
      <RecipeTextArea
        isDisabled
        recipe={convertedRecipe
          .map((x) => getConvertedLine(x, usableScale, keepTeaspoons, keepEggs))
          .join("\n")}
      />
      <RecipeTable
        data={convertedRecipe}
        setConvertedRecipe={setConvertedRecipe}
        scale={usableScale}
        keepTeaspoons={keepTeaspoons}
        keepEggs={keepEggs}
      />
    </>
  );
};

export default RecipeConverter;
