import React from "react";
import { Flex, chakra } from "@chakra-ui/react";
import useDocumentTitle from "../hooks/useDocumentTitle";

const NotFound: React.FC = () => {
  useDocumentTitle("floatingfile");
  return (
    <Flex justify="center" align="center" h="100vh" w="100vw">
      <chakra.p>This page does not exist.</chakra.p>
    </Flex>
  );
};

export default NotFound;
