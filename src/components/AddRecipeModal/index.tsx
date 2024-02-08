import {
  Button,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  AggregatedIngredientInfo,
  IngredientConversionInformation,
  RecipeForShoppingList,
} from "../../types";
import { convertRecipe } from "../../utils";
import MobdalConversionVerify from "./ModalConversionVerify";
import ModalRecipeInput from "./ModalRecipeInput";

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  addRecipe: (newRecipe: RecipeForShoppingList) => void;
}

type Steps = "add-recipe" | "convert-recipe";

const AddRecipeModal = ({
  isOpen,
  onClose,
  addRecipe,
}: AddRecipeModalProps) => {
  const [recipe, setRecipe] = useState("");
  const [recipeName, setRecipeName] = useState("");
  const [convertedRecipe, setConvertedRecipe] = useState<
    IngredientConversionInformation[]
  >([]);
  const [step, setStep] = useState<Steps>("add-recipe");

  const closeAndResetModal = () => {
    onClose();
    setRecipe("");
    setRecipeName("");
    setStep("add-recipe");
  };

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

      addRecipe({
        recipeName,
        ingredients: ingredientSums,
        miscIngredients,
      });
      closeAndResetModal();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Recipe to Shopping List</ModalHeader>
        <ModalCloseButton />

        <div className="modal-body">
          {step === "add-recipe" ? (
            <ModalRecipeInput
              recipe={recipe}
              setRecipe={setRecipe}
              recipeName={recipeName}
              setRecipeName={setRecipeName}
            />
          ) : (
            <MobdalConversionVerify
              convertedRecipe={convertedRecipe}
              setConvertedRecipe={setConvertedRecipe}
            />
          )}
        </div>

        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={onMainButtonClick}
            isDisabled={step === "add-recipe" && recipe.length === 0}
          >
            {step === "add-recipe" ? "Convert" : "Add"}
          </Button>
          <Button onClick={closeAndResetModal}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddRecipeModal;
