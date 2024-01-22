import { Textarea } from "@chakra-ui/react";
import { ChangeEventHandler } from "react";

interface RecipeTextAreaProps {
  recipe: string;
  onInputChange?: ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  isDisabled?: boolean;
}

const RecipeTextArea = ({
  recipe,
  onInputChange,
  placeholder,
  isDisabled,
}: RecipeTextAreaProps) => (
  <Textarea
    value={recipe}
    onChange={onInputChange}
    size="lg"
    height={300}
    placeholder={placeholder}
    isDisabled={isDisabled}
  />
);

export default RecipeTextArea;
