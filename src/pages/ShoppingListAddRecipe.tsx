import { Button, Input } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobdalConversionVerify from "../components/AddRecipeModal/ModalConversionVerify";
import RecipeTextArea from "../components/RecipeTextArea";
import {
  AggregatedIngredientInfo,
  IngredientConversionInformation,
} from "../types";
import { convertRecipe } from "../utils";

type Steps = "add-recipe" | "convert-recipe";

const ShoppingListAddRecipe = () => {
  const [recipe, setRecipe] = useState("");
  const [recipeName, setRecipeName] = useState("");
  const [convertedRecipe, setConvertedRecipe] = useState<
    IngredientConversionInformation[]
  >([]);
  const [step, setStep] = useState<Steps>("add-recipe");
  const navigate = useNavigate();

  const onMainButtonClick = () => {
    if (step === "add-recipe") {
      setConvertedRecipe(convertRecipe(recipe));
      setStep("convert-recipe");
    } else {
      const ingredientSums: Record<string, AggregatedIngredientInfo> = {};
      const miscIngredients: string[] = [];

      for (const recipeLine of convertedRecipe) {
        if (recipeLine.closestMeasurementKey) {
          if (!ingredientSums[recipeLine.closestMeasurementKey]) {
            ingredientSums[recipeLine.closestMeasurementKey] = {
              totalQuantity: 0,
              lines: [],
            };
          }

          const currentIngredient =
            ingredientSums[recipeLine.closestMeasurementKey];

          if (recipeLine.measurementInGrams !== undefined) {
            const numToAdd = Array.isArray(recipeLine.measurementInGrams)
              ? recipeLine.measurementInGrams[1]
              : recipeLine.measurementInGrams;
            currentIngredient.totalQuantity =
              currentIngredient.totalQuantity + numToAdd;

            currentIngredient.lines.push(recipeLine.originalLine);
          }
        } else {
          miscIngredients.push(recipeLine.originalLine);
        }
      }

      navigate("/shopping-list", {
        state: {
          recipeName,
          ingredients: ingredientSums,
          miscIngredients,
        },
      });
    }
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
          <RecipeTextArea
            recipe={recipe}
            onInputChange={(e) => setRecipe(e.target.value)}
            placeholder="Enter recipe here"
            dontResize
          />
        </>
      ) : (
        <MobdalConversionVerify
          convertedRecipe={convertedRecipe}
          setConvertedRecipe={setConvertedRecipe}
        />
      )}
      <div className="add-recipe-controls">
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
