import { Button, Heading } from "@chakra-ui/react";
import { useState } from "react";
import "./App.css";
import RecipeTable from "./components/RecipeTable";
import RecipeTextArea from "./components/RecipeTextArea";
import { ingredientsWithMeasurements } from "./ingredients";
import { IngredientConversionInformation } from "./types";
import {
  findClosestKey,
  getGramsForCompleteMeasurement,
  getGramsFromMetricMeasurement,
  parseRecipeLine,
} from "./utils";

function App() {
  const [recipe, setRecipe] = useState("");
  const [convertedRecipe, setConvertedRecipe] = useState<
    IngredientConversionInformation[]
  >([]);

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRecipe(e.target.value);
  };

  const onConvertRecipe = () => {
    const newConversion: IngredientConversionInformation[] = [];
    for (const line of recipe.split("\n")) {
      if (line.length === 0) continue;

      const ingredientInfo = parseRecipeLine(line);

      if (!ingredientInfo) {
        newConversion.push({
          originalLine: line,
          newLine: line,
        });
        continue;
      }

      // If given ounces or grams, just convert quickly
      if (ingredientInfo.isMetric) {
        newConversion.push({
          originalLine: line,
          parsedLine: ingredientInfo,
          newLine: `${getGramsFromMetricMeasurement(
            ingredientInfo.regexMatch
          )} ${ingredientInfo.ingredientName}`,
        });
        continue;
      }

      const closestMeasurementKey = findClosestKey(
        ingredientInfo.ingredientName
      );
      if (!closestMeasurementKey) {
        newConversion.push({
          originalLine: line,
          newLine: line,
          parsedLine: ingredientInfo,
        });
      } else {
        newConversion.push({
          originalLine: line,
          parsedLine: ingredientInfo,
          closestMeasurementKey,
          newLine: `${getGramsForCompleteMeasurement(
            ingredientInfo,
            ingredientsWithMeasurements[closestMeasurementKey]
          )} ${ingredientInfo.ingredientName}`,
        });
      }
    }

    setConvertedRecipe(newConversion);
  };

  return (
    <>
      <Heading as="h1" size="2xl" textAlign="center" mb={10}>
        Recipe Converter
      </Heading>
      <div className="container">
        <RecipeTextArea recipe={recipe} onInputChange={onInputChange} />
        <Button onClick={onConvertRecipe} isDisabled={recipe.length === 0}>
          Convert Recipe
        </Button>
        <RecipeTextArea
          isDisabled
          recipe={convertedRecipe.map((x) => x.newLine).join("\n")}
        />
        <RecipeTable
          data={convertedRecipe}
          setConvertedRecipe={setConvertedRecipe}
        />
      </div>
    </>
  );
}

export default App;
