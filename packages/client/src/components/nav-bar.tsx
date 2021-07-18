import React, { useEffect, useState } from "react";
import PublicIcon from "@material-ui/icons/Public";
import HistoryIcon from "@material-ui/icons/History";
import PeopleIcon from "@material-ui/icons/People";
import FolderIcon from "@material-ui/icons/Folder";
import { useLocation, useHistory } from "react-router-dom";
import { Flex, Icon } from "@chakra-ui/react";

export interface NavBarProps {
  baseUrl: string;
  orientation: "vertical" | "horizontal";
}

const NavBar: React.FC<NavBarProps> = ({ baseUrl, orientation }) => {
  const [active, setActive] = useState<number>(1);
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const pathArr = location.pathname.split("/");
    const panel =
      pathArr.length === 3 ? "connect" : pathArr[pathArr.length - 1];

    if (panel === "files") {
      if (orientation === "vertical") setActive(1);
      else setActive(0);
    } else if (panel === "connect") setActive(1);
    else if (panel === "history") setActive(2);
    else if (panel === "users") setActive(3);
    else if (panel === "settings") setActive(4);
  }, [location, orientation]);

  const LINKS = [
    { name: "/files", icon: FolderIcon },
    { name: "", icon: PublicIcon },
    { name: `/history`, icon: HistoryIcon },
    { name: `/users`, icon: PeopleIcon },
  ];

  return (
    <Flex
      direction={orientation === "vertical" ? "column" : "row"}
      h="100%"
      w="100%"
      bg="blue.500"
    >
      {LINKS.map(({ name, icon }, index) => (
        <Flex
          onClick={() => history.push(baseUrl + name)}
          _hover={{ cursor: "pointer" }}
          align="center"
          justify="center"
          bg={active === index ? "white" : "blue.500"}
          w={orientation === "vertical" ? "80px" : "64px"}
          h={orientation === "vertical" ? "80px" : "64px"}
          transition="background-color 0.3s"
          display={
            orientation === "vertical" && index === 0 ? "none" : "inherit"
          }
        >
          <Icon
            transition="color 0.3s"
            color={active === index ? "blue.500" : "white"}
            as={icon}
          />
        </Flex>
      ))}
    </Flex>
  );
};

export default NavBar;
