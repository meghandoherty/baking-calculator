import {
  ChakraProvider,
  extendTheme,
  type ThemeConfig,
} from "@chakra-ui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import IngredientOrganizer from "./pages/IngredientOrganizer.tsx";
import RecipeConverter from "./pages/RecipeConverter.tsx";

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
          path: "ingredient-organizer",
          element: <IngredientOrganizer />,
        },
      ],
    },
  ],
  {
    basename: "/baking-calculator",
  }
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={customTheme}>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>
);
