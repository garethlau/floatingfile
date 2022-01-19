import React, { useState } from "react";
import MoonLoader from "react-spinners/MoonLoader";
import { useTheme, Text, Flex, Box } from "@chakra-ui/react";

const phrases: string[] = [
  "Getting things ready...",
  "Preparing the space...",
  "This shouldn't take too long...",
  "Just a moment...",
  "Warming up the space...",
];

const FullPageLoader: React.FC = () => {
  const [rand] = useState(() => Math.floor(Math.random() * phrases.length));
  const theme = useTheme();

  return (
    <Flex w="100vw" h="100vh" bg="lightShade" align="center" justify="center">
      <Box>
        <Text color="gray.500">{phrases[rand]}</Text>
        <MoonLoader
          css="margin: auto;"
          color={theme.colors.mainBrand}
          size={32}
        />
      </Box>
    </Flex>
  );
};

export default FullPageLoader;
