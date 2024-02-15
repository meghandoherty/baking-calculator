import {
  ChakraProvider,
  extendTheme,
  type ThemeConfig,
} from "@chakra-ui/react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import RecipeConverter from "./pages/RecipeConverter/index.tsx";
import ShoppingList from "./pages/ShoppingList/index.tsx";
import ShoppingListAddRecipe from "./pages/ShoppingListAddRecipe/index.tsx";

const config: ThemeConfig = {
  initialColorMode: "system",
  useSystemColorMode: true,
};

const customTheme = extendTheme({ config });

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        { index: true, element: <Navigate to="/recipe-converter" replace /> },
        {
          path: "recipe-converter",
          element: <RecipeConverter />,
        },
        {
          path: "shopping-list",
          element: <Outlet />,
          children: [
            {
              index: true,

              element: <ShoppingList />,
            },
            {
              path: "add-recipe",
              element: <ShoppingListAddRecipe />,
            },
          ],
        },
        {
          path: "*",
          element: <Navigate to="/recipe-converter" replace />,
        },
      ],
    },
  ],
  {
    basename: "/baking-calculator",
  }
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ChakraProvider theme={customTheme}>
    <RouterProvider router={router} />
  </ChakraProvider>
);
