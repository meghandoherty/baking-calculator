import { Button, Input } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RecipeTextArea from "../../components/RecipeTextArea";
import ScaleInput from "../../components/ScaleInput";
import VerifyRecipeConversionTable from "../../components/VerifyRecipeConversionTable";
import { numbersAtBeginningOfLineRegex } from "../../regex";
import {
  AggregatedIngredientInfo,
  IngredientConversionInformationForShoppingList,
  RecipeForShoppingList,
} from "../../types";
import { convertRecipe } from "../../utils";
import styles from "./ShoppingListAddRecipe.module.scss";

type Steps = "add-recipe" | "convert-recipe";

const ShoppingListAddRecipe = () => {
  const [recipe, setRecipe] = useState("");
  const [recipeName, setRecipeName] = useState("");
  const [recipeUrl, setRecipeUrl] = useState("");
  const [recipeScale, setRecipeScale] = useState(1);
  const [convertedRecipe, setConvertedRecipe] = useState<
    IngredientConversionInformationForShoppingList[]
  >([]);
  const [step, setStep] = useState<Steps>("add-recipe");
  const navigate = useNavigate();

  const onMainButtonClick = () => {
    if (step === "add-recipe") {
      const convertedRecipeBaseInfo = convertRecipe(recipe);
      const newConvertedRecipe: IngredientConversionInformationForShoppingList[] =
        convertedRecipeBaseInfo.map((info) => {
          // Use custom measurement by default if the line can't be parsed
          const useCustomMeasurement = info.parsedLine === undefined;
          if (!useCustomMeasurement) {
            return {
              ...info,
              useCustomMeasurement,
            };
          }

          // Try to parse the line as a custom measurement by pulling out number
          const numberMatch = info.originalLine.match(
            numbersAtBeginningOfLineRegex
          );

          return {
            ...info,
            useCustomMeasurement,
            ...(numberMatch && {
              customMeasurementQuantity: numberMatch[2]
                ? numberMatch[2]
                : numberMatch[1],
              customMeasurementUnit: numberMatch[3],
            }),
          };
        });
      setConvertedRecipe(newConvertedRecipe);
      setStep("convert-recipe");
    } else {
      const ingredientSums: Record<string, AggregatedIngredientInfo> =
        Object.create(null);
      const miscIngredients: string[] = [];

      for (const recipeLine of convertedRecipe) {
        let quantity: number | undefined;
        let ingredient: string | undefined;
        const isCustomIngredient = recipeLine.useCustomMeasurement;

        if (isCustomIngredient) {
          quantity = recipeLine.customMeasurementQuantity
            ? parseInt(recipeLine.customMeasurementQuantity)
            : undefined;
          ingredient = recipeLine.customMeasurementUnit;
        } else {
          quantity = Array.isArray(recipeLine.measurementInGrams)
            ? recipeLine.measurementInGrams[1]
            : recipeLine.measurementInGrams;
          ingredient = recipeLine.closestMeasurementKey;
        }

        if (ingredient) {
          if (!ingredientSums[ingredient]) {
            ingredientSums[ingredient] = {
              totalQuantity: 0,
              lines: [],
              isCustomIngredient,
              parsedLines: [],
            };
          }

          const currentIngredient = ingredientSums[ingredient];

          if (quantity !== undefined) {
            currentIngredient.totalQuantity =
              currentIngredient.totalQuantity + quantity;

            currentIngredient.lines.push(recipeLine.originalLine);
            if (recipeLine.parsedLine) {
              currentIngredient.parsedLines.push(recipeLine.parsedLine);
            }
          }
        } else {
          miscIngredients.push(recipeLine.originalLine);
        }
      }

      const newRecipe: RecipeForShoppingList = {
        recipeName,
        recipeUrl,
        ingredients: ingredientSums,
        scale: recipeScale,
        miscIngredients,
      };

      navigate("/shopping-list", {
        state: { ...newRecipe },
      });
    }
  };

  const updateRecipeLine = (
    lineNumber: number,
    newInfo: IngredientConversionInformationForShoppingList
  ) => {
    setConvertedRecipe(
      convertedRecipe.map((info, idx) => (idx === lineNumber ? newInfo : info))
    );
  };

  return (
    <>
      {step === "add-recipe" ? (
        <>
          <Input
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            placeholder="Recipe Name"
          />
          <Input
            value={recipeUrl}
            onChange={(e) => setRecipeUrl(e.target.value)}
            placeholder="Link to Recipe"
          />
          <ScaleInput
            scale={recipeScale}
            setScale={setRecipeScale}
            className={styles["scale-input"]}
          />
          <RecipeTextArea
            recipe={recipe}
            onInputChange={(e) => setRecipe(e.target.value)}
            placeholder="Enter recipe here"
            dontResize
          />
        </>
      ) : (
        <VerifyRecipeConversionTable
          convertedRecipe={convertedRecipe}
          updateRecipeLine={updateRecipeLine}
        />
      )}
      <div className={styles["add-recipe-controls"]}>
        <Button colorScheme="blue" onClick={onMainButtonClick}>
          {step === "add-recipe" ? "Convert Recipe" : "Add Recipe"}
        </Button>
        <Button
          colorScheme="blue"
          variant="outline"
          onClick={() => navigate("/shopping-list")}
        >
          Cancel
        </Button>
      </div>
    </>
  );
};

export default ShoppingListAddRecipe;
