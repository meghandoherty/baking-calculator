import RecipeTextArea from "../RecipeTextArea";

interface ModalRecipeInputProps {
  recipe: string;
  setRecipe: React.Dispatch<React.SetStateAction<string>>;
}

const ModalRecipeInput = ({ recipe, setRecipe }: ModalRecipeInputProps) => {
  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRecipe(e.target.value);
  };

  return <RecipeTextArea recipe={recipe} onInputChange={onInputChange} />;
};

export default ModalRecipeInput;
