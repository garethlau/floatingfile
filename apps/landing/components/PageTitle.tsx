import React from "react";
import { Box, Container, chakra, useColorModeValue } from "@chakra-ui/react";

const PageTitle: React.FC = ({ children }) => (
  <Box as="section" w="100%" h="auto" pt="80px" pb="40px">
    <Container>
      <Box textAlign="center">
        <chakra.h1
          maxW="16ch"
          mx="auto"
          fontSize={{ base: "2.25rem", sm: "3rem", lg: "4rem" }}
          fontFamily="heading"
          fontWeight="extrabold"
          mb="16px"
          lineHeight="1.2"
          color={useColorModeValue("gray.700", "white")}
        >
          {children}
        </chakra.h1>
      </Box>
    </Container>
  </Box>
);

export default PageTitle;
