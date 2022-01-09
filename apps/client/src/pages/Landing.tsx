import React, { useState } from "react";
import { Colors, Logo } from "@floatingfile/ui";
import { useHistory } from "react-router-dom";
import {
  Flex,
  Spacer,
  chakra,
  Box,
  Stack,
  Input,
  useToast,
  Link,
} from "@chakra-ui/react";
import { USERNAME_STORAGE_KEY, VERSION } from "../env";
import Button from "../components/Button";
import Seperator from "../components/Seperator";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useRandomElement from "../hooks/useRandomElement";
import rpc from "../lib/rpc";

const Landing: React.FC = () => {
  useDocumentTitle("floatingfile");
  const history = useHistory();
  const [code, setCode] = useState("");

  const phrase = useRandomElement([
    "Simplify your file transfer workflow.",
    "File transfer, simplified.",
    "The best of file transfer and file sharing.",
    "File sharing and file transfer in one.",
  ]);

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length > 6) return;
    setCode(e.target.value.toUpperCase());
  }

  const toast = useToast();

  function handleKeyPress(event: React.KeyboardEvent) {
    if (event.key === "Enter") {
      join();
    }
  }

  async function join() {
    if (code.length !== 6) {
      if (!toast.isActive("invalid-code-length-id")) {
        toast({
          id: "invalid-code-length-id",
          title: "Invalid code length.",
          status: "error",
          isClosable: true,
          position: "top",
        });
      }
      return;
    }

    const format = /[ !@#$%^&*()_+\-=\]{};':"\\|,.<>?]/;

    if (format.test(code)) {
      // Contains special characters
      if (!toast.isActive("invalid-characters-id")) {
        toast({
          id: "invalid-characters-id",
          title: "Invalid characters.",
          status: "error",
          isClosable: true,
          position: "top",
        });
      }
      return;
    }

    try {
      const space = await rpc.invoke("findSpace", { code });
      if (!space) {
        toast({
          title: "Space does not exist.",
          status: "error",
          isClosable: true,
          position: "top",
        });
        return;
      }
      toast({
        title: "Joining space.",
        status: "success",
        isClosable: true,
        position: "top",
      });
      setTimeout(() => {
        toast.closeAll();
        history.push(`/s/${code}`);
      }, 1500);
    } catch {
      toast({
        title: "An unexpected error occurred.",
        status: "error",
        isClosable: true,
        position: "top",
      });
    }
  }

  async function create() {
    try {
      const space = await rpc.invoke("createSpace", {
        username: localStorage.getItem(USERNAME_STORAGE_KEY)!,
      });

      // const space = await createSpace();
      if (space && space.code) {
        history.push(`/s/${space.code}`);
      }
    } catch {
      toast({
        title: "An unexpected error occured.",
        status: "error",
        isClosable: true,
        position: "top",
      });
    }
  }

  return (
    <Box
      height="100vh"
      display="flex"
      bg={Colors.LIGHT_SHADE}
      overflowY="hidden"
    >
      <Flex
        bg={Colors.MAIN_BRAND}
        direction="column"
        display={["none", "none", "inherit"]}
        w={[0, 0, "450px", "500px"]}
        p={4}
      >
        <Link
          isExternal
          href="http://floatingfile.space"
          _hover={{ textDecoration: "none" }}
        >
          <Flex align="center">
            <Logo fill="white" width="32px" height="32px" />
            <chakra.p ml="10px" color="white">
              floatingfile
            </chakra.p>
          </Flex>
        </Link>
        <Spacer />
        <chakra.p
          lineHeight={1}
          fontWeight="bold"
          color="white"
          fontSize={["2rem", "3rem", "4rem"]}
        >
          {phrase}
        </chakra.p>
        <Spacer />
        <chakra.a
          color="white"
          textDecoration="none"
          href="https://floatingfile.space/changelog"
        >
          {VERSION && `Version ${VERSION}`}
        </chakra.a>
      </Flex>

      <Flex align="center" justify="center" w="100%">
        <Stack spacing={4} w="250px" h="min-content">
          <Input
            placeholder="CODE"
            isFullWidth
            spellCheck={false}
            onChange={handleCodeChange}
            value={code}
            variant="outline"
            textAlign="center"
            fontWeight="bold"
            letterSpacing="3px"
            bg="white"
            onKeyPress={handleKeyPress}
          />

          <Button
            onClick={join}
            id="join-space-btn"
            colorScheme="blue"
            isFullWidth
          >
            Join
          </Button>

          <Seperator text="OR" />

          <Button
            onClick={create}
            isLoading={false} // FIXME:
            id="create-space-btn"
            isFullWidth
            colorScheme="blue"
          >
            Create a Space
          </Button>
        </Stack>
      </Flex>
    </Box>
  );
};

export default Landing;
