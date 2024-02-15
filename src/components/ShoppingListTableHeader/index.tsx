import { IconButton, Link, Th } from "@chakra-ui/react";
import CloseIcon from "../../icons/CloseIcon";
import ExternalLinkIcon from "../../icons/ExternalLinkIcon";
import { RecipeForShoppingList } from "../../types";

import styles from "./ShoppingListTableHeader.module.scss";

interface ShoppingListTableHeaderProps {
  recipe: RecipeForShoppingList;
  idx: number;
  setShoppingListRecipes: React.Dispatch<
    React.SetStateAction<RecipeForShoppingList[]>
  >;
}

const ShoppingListTableHeader = ({
  recipe,
  idx,
  setShoppingListRecipes,
}: ShoppingListTableHeaderProps) => {
  const recipeName =
    recipe.recipeName?.length > 0 ? recipe.recipeName : `Recipe ${idx + 1}`;

  const nameNode = recipe.recipeUrl ? (
    <Link href={recipe.recipeUrl} isExternal>
      {recipeName}
      <ExternalLinkIcon />
    </Link>
  ) : (
    recipeName
  );

  return (
    <Th key={`${recipe.recipeName} ${idx}`}>
      <div className={styles["table-header"]}>
        {nameNode}
        <IconButton
          aria-label="Delete recipe from shopping list"
          icon={<CloseIcon />}
          size="xs"
          variant="outline"
          colorScheme="blue"
          onClick={() =>
            setShoppingListRecipes((prev) =>
              prev.filter((_, idx2) => idx2 !== idx)
            )
          }
        />
      </div>
    </Th>
  );
};

export default ShoppingListTableHeader;
