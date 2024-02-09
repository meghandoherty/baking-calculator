import { Heading } from "@chakra-ui/react";
import { Outlet, useLocation } from "react-router-dom";
import "./App.css";
import NavBar from "./components/NavBar";

const pageTitles: Record<string, string> = {
  "/recipe-converter": "Recipe Converter",
  "/shopping-list": "Shopping List",
  "/shopping-list/add-recipe": "Add Recipe to Shopping List",
};

function App() {
  const { pathname } = useLocation();
  return (
    <>
      <NavBar />
      <div
        className={`container ${
          pathname === "/recipe-converter" ? "grid" : ""
        }`}
      >
        <Heading as="h1" textAlign="center" mb={10} className="full-width">
          {pageTitles[pathname]}
        </Heading>
        <Outlet />
      </div>
    </>
  );
}

export default App;
