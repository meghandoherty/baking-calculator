import { Textarea } from "@chakra-ui/react";
import { ChangeEventHandler } from "react";

interface RecipeTextAreaProps {
  recipe: string;
  onInputChange?: ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  isDisabled?: boolean;
  dontResize?: boolean;
}

const RecipeTextArea = ({
  recipe,
  onInputChange,
  placeholder,
  isDisabled,
  dontResize,
}: RecipeTextAreaProps) => (
  <Textarea
    value={recipe}
    onChange={onInputChange}
    size="lg"
    height={300}
    placeholder={placeholder}
    isDisabled={isDisabled}
    resize={dontResize ? "none" : "vertical"}
  />
);

export default RecipeTextArea;
