import React, { useState } from "react";
import { Colors } from "@floatingfile/common";
import axios from "axios";
import { useSnackbar, SnackbarOrigin } from "notistack";
import { useHistory } from "react-router-dom";
import { Flex, Spacer, chakra, Box, Stack } from "@chakra-ui/react";
import { BASE_API_URL, VERSION } from "../env";
import GInput from "../components/GInput";
import Button from "../components/Button";
import Seperator from "../components/Seperator";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useCreateSpace from "../mutations/useCreateSpace";
import useRandomElement from "../hooks/useRandomElement";

const anchorOrigin: SnackbarOrigin = {
  vertical: "top",
  horizontal: "center",
};

const Landing: React.FC = () => {
  const history = useHistory();
  const [code, setCode] = useState("");
  const { mutateAsync: createSpace, isLoading: creatingSpace } =
    useCreateSpace();

  const phrase = useRandomElement([
    "Simplify your file transfer workflow.",
    "File transfer, simplified.",
    "The best of file transfer and file sharing.",
    "File sharing and file transfer in one.",
  ]);
  useDocumentTitle("floatingfile");

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length > 6) return;
    setCode(e.target.value.toUpperCase());
  }

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  async function join() {
    if (code.length !== 6) {
      enqueueSnackbar("Invalid code length.", {
        variant: "error",
        anchorOrigin,
      });
      return;
    }

    const format = /[ !@#$%^&*()_+\-=\]{};':"\\|,.<>?]/;

    if (format.test(code)) {
      // Contains special characters
      enqueueSnackbar("Invalid characters.", {
        variant: "error",
        anchorOrigin,
      });
      return;
    }

    try {
      await axios.get(`${BASE_API_URL}/api/v5/spaces/${code}`);
      enqueueSnackbar("Joining space.", {
        variant: "success",
        anchorOrigin,
      });
      setTimeout(() => {
        closeSnackbar();
        history.push(`/s/${code}`);
      }, 1500);
    } catch (err) {
      if (err.response.status === 404) {
        enqueueSnackbar("Space does not exist.", {
          variant: "error",
          anchorOrigin,
        });
      } else {
        enqueueSnackbar("There was an error.", {
          variant: "error",
          anchorOrigin,
        });
      }
    }
  }

  async function create() {
    try {
      const space = await createSpace();
      if (space && space.code) {
        history.push(`/s/${space.code}`);
      }
    } catch {
      enqueueSnackbar("There was an error.", {
        variant: "error",
        anchorOrigin,
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
        <chakra.p color="white">floatingfile</chakra.p>
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
          <GInput
            onChange={handleCodeChange}
            value={code}
            placeholder="CODE"
            center
            fullWidth
            spellCheck={false}
            style={{ fontWeight: "bold", letterSpacing: "2px" }}
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
            isLoading={creatingSpace}
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
