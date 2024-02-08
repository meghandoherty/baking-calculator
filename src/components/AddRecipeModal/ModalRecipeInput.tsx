import { Input } from "@chakra-ui/react";
import RecipeTextArea from "../RecipeTextArea";

interface ModalRecipeInputProps {
  recipe: string;
  setRecipe: React.Dispatch<React.SetStateAction<string>>;
  recipeName: string;
  setRecipeName: React.Dispatch<React.SetStateAction<string>>;
}

const ModalRecipeInput = ({
  recipe,
  setRecipe,
  recipeName,
  setRecipeName,
}: ModalRecipeInputProps) => {
  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRecipe(e.target.value);
  };

  return (
    <>
      <Input
        value={recipeName}
        onChange={(e) => setRecipeName(e.target.value)}
        placeholder="Recipe Name"
      />
      <RecipeTextArea recipe={recipe} onInputChange={onInputChange} />
    </>
  );
};

export default ModalRecipeInput;
