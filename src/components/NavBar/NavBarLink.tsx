import { Link as ChakraLink } from "@chakra-ui/react";
import { NavLink as ReactRouterLink } from "react-router-dom";

interface NavBarLinkProps {
  text: string;
  to: string;
}

const NavBarLink = ({ text, to }: NavBarLinkProps) => (
  <ChakraLink to={to} as={ReactRouterLink}>
    {text}
  </ChakraLink>
);

export default NavBarLink;
