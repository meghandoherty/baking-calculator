import { Button, Checkbox } from "@chakra-ui/react";
import { useState } from "react";
import RecipeTable from "../components/RecipeTable";
import RecipeTextArea from "../components/RecipeTextArea";
import ScaleInput from "../components/ScaleInput";
import { IngredientConversionInformation } from "../types";
import { convertRecipe, getConvertedLine } from "../utils";

const RecipeConverter = () => {
  const [recipe, setRecipe] = useState("");
  const [convertedRecipe, setConvertedRecipe] = useState<
    IngredientConversionInformation[]
  >([]);
  const [scale, setScale] = useState(1);
  const [keepTeaspoons, setKeepTeaspoons] = useState(false);
  const [keepEggs, setKeepEggs] = useState(false);

  const usableScale = scale > 0 ? scale : 1;

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRecipe(e.target.value);
  };

  const onConvertRecipe = () => {
    setConvertedRecipe(convertRecipe(recipe));
  };

  return (
    <>
      <RecipeTextArea recipe={recipe} onInputChange={onInputChange} />
      <div className="controls">
        <Button onClick={onConvertRecipe} isDisabled={recipe.length === 0}>
          Convert Recipe
        </Button>
        <ScaleInput scale={scale} setScale={setScale} />
        <div className="controls-checkboxes">
          <Checkbox
            isChecked={keepTeaspoons}
            onChange={(e) => setKeepTeaspoons(e.target.checked)}
          >
            Don't Convert Teaspoons
          </Checkbox>
          <Checkbox
            isChecked={keepEggs}
            onChange={(e) => setKeepEggs(e.target.checked)}
          >
            Don't Convert Eggs
          </Checkbox>
        </div>
      </div>
      <RecipeTextArea
        isDisabled
        recipe={convertedRecipe
          .map((x) => getConvertedLine(x, usableScale, keepTeaspoons, keepEggs))
          .join("\n")}
      />
      <RecipeTable
        data={convertedRecipe}
        setConvertedRecipe={setConvertedRecipe}
        scale={usableScale}
        keepTeaspoons={keepTeaspoons}
        keepEggs={keepEggs}
      />
    </>
  );
};

export default RecipeConverter;
