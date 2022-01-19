import React from "react";
import { Flex, Button, Box, Text, chakra } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";

const SpaceNotFound: React.FC = () => {
  return (
    <Flex w="100vw" h="100vh" bg="lightShade" align="center" justify="center">
      <Box>
        <Text color="gray.500">
          <chakra.span
            role="img"
            aria-label="Frowny face emoji"
            aria-labelledby="Frowny face emoji"
          >
            🙁{" "}
          </chakra.span>
          Oops!
        </Text>
        <Text color="gray.500">
          It seems that the space you are trying to access does not exist.
        </Text>
        <Text color="gray.500">Please double check the code.</Text>
        <Button
          as="a"
          href="/"
          variant="link"
          mt={4}
          leftIcon={<ArrowBackIcon />}
        >
          Take me home
        </Button>
      </Box>
    </Flex>
  );
};

export default SpaceNotFound;
