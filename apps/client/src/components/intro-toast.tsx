import React from "react";
import Button from "./Button";
import { USERNAME_STORAGE_KEY } from "../env";
import { chakra, HStack, Stack } from "@chakra-ui/react";

const IntroToast: React.FC<{
  handleClose: React.MouseEventHandler<HTMLButtonElement>;
}> = ({ handleClose }) => {
  const username = localStorage.getItem(USERNAME_STORAGE_KEY || "");

  return (
    <Stack spacing={4} maxW="400px" bg="gray.800" borderRadius="md" p={4}>
      <chakra.p color="white">Welcome to floatingfile 👋</chakra.p>
      <chakra.p color="white">
        Your randomly generated nickname is: <b>{username}</b>. Please be aware
        that anyone can download your files long as they are in the space.
      </chakra.p>
      <HStack>
        <Button colorScheme="blue" onClick={handleClose}>
          Got It
        </Button>
        <Button
          colorScheme="white"
          as="a"
          target="_blank"
          href="https://floatingfile.space/faq"
        >
          Learn More
        </Button>
      </HStack>
    </Stack>
  );
};

export default IntroToast;
