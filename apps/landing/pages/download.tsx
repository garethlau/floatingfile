import React from "react";
import { NextSeo } from "next-seo";
import InstallAppButton from "components/install-app-button";
import {
  Image,
  Text,
  Box,
  Grid,
  Flex,
  GridItem,
  Heading,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import Page from "components/Page";

const Card: React.FC = ({ children }) => (
  <Box
    bg={useColorModeValue("gray.200", "gray.600")}
    textAlign="center"
    borderRadius="md"
    p={4}
    h="500px"
  >
    {children}
  </Box>
);

const CardHeader: React.FC = ({ children }) => (
  <Heading as="h2" mb={4}>
    {children}
  </Heading>
);

const IosPage: React.FC = () => {
  return (
    <>
      <NextSeo
        title={"floatingfile | Download"}
        description={"Download floatingfile on your device!"}
        openGraph={{
          url: "https://www.floatingfile.space/download",
          title: "floatingfile | Download",
          description: "Download floatingfile on your device!",
        }}
      />

      <Page title="Download">
        <Grid
          gap={4}
          templateColumns={{ base: "1fr", md: "1fr 1fr" }}
          templateRows={{
            base: "repeat(4, auto)",
            md: "1fr 1fr",
          }}
        >
          <GridItem>
            <Card>
              <Flex
                justify="space-between"
                direction="column"
                align="center"
                h="100%"
              >
                <CardHeader>iOS</CardHeader>
                <Text>
                  Download the floatingfile app for a native, feature-rich
                  experience powered by the latest mobile technologies.
                </Text>
                <Image
                  maxH="300px"
                  borderRadius="md"
                  src="/images/ios-app.png"
                  alt=""
                />
                <InstallAppButton store="apple" />
              </Flex>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <Flex
                justify="space-between"
                direction="column"
                align="center"
                h="100%"
              >
                <CardHeader>Android</CardHeader>
                <Text opacity="0.5" size="sm">
                  Coming soon, hopefully...
                </Text>
                <InstallAppButton store="google" disabled />
              </Flex>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <Flex
                justify="space-between"
                direction="column"
                align="center"
                h="100%"
              >
                <CardHeader>CLI</CardHeader>
                <Text>
                  Interact with floatingfile directly from the command line.
                  Collaborate with others without ever leaving the terminal.
                </Text>
                <Image
                  maxH="300px"
                  borderRadius="md"
                  src="/images/cli-preview.png"
                  alt=""
                />
                <Button
                  bg="black"
                  color="white"
                  _hover={{}}
                  _active={{}}
                  size="lg"
                  as="a"
                  href="/cli"
                >
                  Learn More
                </Button>
              </Flex>
            </Card>
          </GridItem>
        </Grid>
      </Page>
    </>
  );
};

export default IosPage;
