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
  Heading,
  Text,
} from "@chakra-ui/react";
import { Colors } from "@floatingfile/ui";
import Button from "../components/Button";
import axios from "axios";
import { ORIGIN } from "../env";

function isValidURL(candidate: string) {
  let url;
  try {
    url = new URL(candidate);
  } catch {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

const CreateTunnel: React.FC = () => {
  useDocumentTitle("floatingfile | Tunnel");
  const toast = useToast();

  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tunnel, setTunnel] = useState("");

  async function generateLink() {
    setIsLoading(true);

    if (!isValidURL(url)) {
      toast({
        title: "Invalid URL",
        status: "error",
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }
    const response = await axios.post("/api/tunnels", { url });
    const { code } = response.data;
    const tunnelUrl = `${ORIGIN}/t/${code}`;
    setTunnel(tunnelUrl);
    navigator.clipboard.writeText(tunnelUrl);
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
          <Heading>Tunnel</Heading>
          <Text>
            Use floatingfile Tunnel to generate a code for any URL. Tunnels last
            6 hours.
          </Text>
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
                {tunnel || "Your tunnel will be here"}
              </chakra.p>
            </chakra.div>
          </CopyToClipboard>
        </Stack>
      </Flex>
    </Box>
  );
};
export default CreateTunnel;
