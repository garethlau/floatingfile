import React from "react";
import { Flex, chakra, Box } from "@chakra-ui/react";

export interface PanelProps {
  title: string;
}

const Panel: React.FC<PanelProps> = ({ title, children }) => {
  return (
    <Flex direction="column" h="100%" w="100%" p={4}>
      <chakra.p
        color="lightAccent"
        textAlign={{ base: "center", md: "left" }}
        fontSize="2rem"
        fontWeight="bold"
      >
        {title}
      </chakra.p>
      <Box h="100%" overflow="auto">
        {children}
      </Box>
    </Flex>
  );
};

export default Panel;
