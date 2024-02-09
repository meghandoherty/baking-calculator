import { Link as ChakraLink } from "@chakra-ui/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import CloseIcon from "../../icons/CloseIcon";
import MenuIcon from "../../icons/MenuIcon";
import NavBarLink from "./NavBarLink";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav>
      <ChakraLink className="logo" fontSize="xl" as={Link} to="/">
        Baking Calculator
      </ChakraLink>
      <div
        className="show-below-medium"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </div>
      <div className={`nav-menu-links ${!isOpen ? "hide-below-medium" : ""}`}>
        <NavBarLink to="recipe-converter" text="Recipe Converter" />
        <NavBarLink to="shopping-list" text="Shopping List" />
      </div>
    </nav>
  );
};

export default NavBar;
