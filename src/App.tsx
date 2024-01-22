import { Button, Heading, Textarea } from "@chakra-ui/react";
import { useState } from "react";
import "./App.css";
import {
  findClosestKey,
  getGramsForCompleteMeasurement,
  getGramsFromMetricMeasurement,
  parseRecipeLine,
} from "./utils";

function App() {
  const [recipe, setRecipe] = useState("");
  const [convertedRecipe, setConvertedRecipe] = useState("");

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRecipe(e.target.value);
  };

  const onConvertRecipe = () => {
    let conversion = "";
    for (const line of recipe.split("\n")) {
      if (line.length === 0) continue;

      const ingredientInfo = parseRecipeLine(line);

      if (!ingredientInfo) {
        conversion += line + "\n";
        continue;
      }

      // If given ounces or grams, just convert quickly
      if (ingredientInfo.isMetric) {
        conversion += `${getGramsFromMetricMeasurement(
          ingredientInfo.regexMatch
        )} ${ingredientInfo.ingredientName}\n`;
        continue;
      }

      const closestMeasurementInfo = findClosestKey(
        ingredientInfo.ingredientName
      );
      if (!closestMeasurementInfo) {
        conversion += line + "\n";
      } else {
        conversion += `${getGramsForCompleteMeasurement(
          ingredientInfo,
          closestMeasurementInfo
        )} ${ingredientInfo.ingredientName}\n`;
      }
    }

    setConvertedRecipe(conversion);
  };

  return (
    <>
      <Heading as="h1" size="2xl" textAlign="center" mb={10}>
        Recipe Converter
      </Heading>
      <div className="container">
        <Textarea
          value={recipe}
          onChange={onInputChange}
          placeholder="Add recipe here"
          size="lg"
          height={300}
        />
        <Button
          onClick={onConvertRecipe}
          width="19rem"
          isDisabled={recipe.length === 0}
        >
          Convert Recipe
        </Button>
        <Textarea isDisabled size="lg" height={300} value={convertedRecipe} />
      </div>
    </>
  );
}

export default App;
