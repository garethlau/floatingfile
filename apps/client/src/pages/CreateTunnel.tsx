import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import useDocumentTitle from "../hooks/useDocumentTitle";
import {
  chakra,
  Box,
  Divider,
  Flex,
  Input,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { Colors } from "@floatingfile/ui";
import Button from "../components/Button";
import axios from "axios";
import { ORIGIN } from "../env";

const CreateTunnel: React.FC = () => {
  useDocumentTitle("Link");
  const toast = useToast();

  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tunnel, setTunnel] = useState("");

  async function generateLink() {
    setIsLoading(true);
    const response = await axios.post("/api/tunnels", { url });
    const { code } = response.data;
    setTunnel(`${ORIGIN}/t/${code}`);
    toast({
      title: "URL copied to clipboard.",
      status: "success",
      isClosable: true,
    });
    setIsLoading(false);
  }

  return (
    <Box height="100vh" display="flex" bg={Colors.LIGHT_SHADE}>
      <Flex align="center" justify="center" w="100vw">
        <Stack spacing={4} w="400px" h="min-content">
          <Input
            placeholder="URL"
            spellCheck={false}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            variant="outline"
            textAlign="center"
            fontWeight="bold"
            bg="white"
          />
          <Button
            colorScheme="blue"
            isFullWidth
            isLoading={isLoading}
            onClick={generateLink}
          >
            Generate Link
          </Button>
          <Divider />
          <CopyToClipboard
            text={tunnel}
            onCopy={() => {
              toast({
                title: "URL copied to clipboard.",
                status: "success",
                isClosable: true,
              });
            }}
          >
            <chakra.div
              w="100%"
              m="10px auto"
              p={2}
              borderRadius="md"
              bg="lightAccent"
              _hover={{ cursor: "pointer" }}
            >
              <chakra.p fontSize="16px" color="white" textAlign="center">
                {tunnel || "Your link will be here"}
              </chakra.p>
            </chakra.div>
          </CopyToClipboard>
        </Stack>
      </Flex>
    </Box>
  );
};
export default CreateTunnel;
