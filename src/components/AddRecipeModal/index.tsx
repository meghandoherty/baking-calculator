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
import { IngredientConversionInformation } from "../../types";
import { convertRecipe } from "../../utils";
import MobdalConversionVerify from "./ModalConversionVerify";
import ModalRecipeInput from "./ModalRecipeInput";

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  addRecipe: (ingredients: IngredientConversionInformation[]) => void;
}

type Steps = "add-recipe" | "convert-recipe";

const AddRecipeModal = ({
  isOpen,
  onClose,
  addRecipe,
}: AddRecipeModalProps) => {
  const [recipe, setRecipe] = useState("");
  const [convertedRecipe, setConvertedRecipe] = useState<
    IngredientConversionInformation[]
  >([]);
  const [step, setStep] = useState<Steps>("add-recipe");

  const closeAndResetModal = () => {
    onClose();
    setRecipe("");
    setStep("add-recipe");
  };

  const onMainButtonClick = () => {
    if (step === "add-recipe") {
      setConvertedRecipe(convertRecipe(recipe));
      setStep("convert-recipe");
    } else {
      addRecipe(convertedRecipe);
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
            <ModalRecipeInput recipe={recipe} setRecipe={setRecipe} />
          ) : (
            <MobdalConversionVerify
              convertedRecipe={convertedRecipe}
              setConvertedRecipe={setConvertedRecipe}
            />
          )}
        </div>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onMainButtonClick}>
            {step === "add-recipe" ? "Convert" : "Add"}
          </Button>
          <Button onClick={closeAndResetModal}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddRecipeModal;
