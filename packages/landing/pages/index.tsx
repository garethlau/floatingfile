import React from "react";
import { NextSeo } from "next-seo";
import { DiGithubBadge } from "react-icons/di";
import { IoSpeedometerOutline } from "react-icons/io5";
import { FaUserSecret } from "react-icons/fa";
import { CgTrashEmpty } from "react-icons/cg";
import { MdGroup } from "react-icons/md";
import {
  Box,
  Container,
  Image,
  Button,
  Heading,
  Stack,
  Grid,
  useColorModeValue,
  chakra,
  Icon,
  useBreakpointValue,
  Text,
} from "@chakra-ui/react";
import NavigationBar from "components/navigation-bar";
import Footer from "components/_Footer";

const Feature = ({ icon, title, children }) => (
  <Box
    bg={useColorModeValue("white", "gray.800")}
    borderRadius="md"
    shadow="base"
    p={6}
    textAlign="left"
  >
    <Icon fontSize="32px" as={icon} color="blue.500" mb={2} />
    <Text fontSize="xl" color="blue.500" fontWeight="bold">
      {title}
    </Text>
    <Text fontSize="xl">{children}</Text>
  </Box>
);

const Home: React.FC = () => {
  return (
    <>
      <NextSeo title={"floatingfile"} />
      <NavigationBar />
      <Box as="section" w="100%" h="auto" py="120px">
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
              Simplify your file transfer workflow with{" "}
              <chakra.span color="blue.500">floatingfile</chakra.span>
            </chakra.h1>

            <Stack
              mt={4}
              justify="center"
              direction={{ base: "column", sm: "row" }}
              spacing={4}
            >
              <Button
                size="lg"
                colorScheme="blue"
                as="a"
                href="https://floatingfile.space"
              >
                Open floatingfile
              </Button>
              <Button
                size="lg"
                as="a"
                href="/"
                target="__blank"
                colorScheme="gray"
                leftIcon={<DiGithubBadge size="1.5em" />}
              >
                Github
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Box mb="-300px">
        <Image
          borderRadius="md"
          w="90%"
          mx="auto"
          src={useBreakpointValue({
            base: "/images/space-ui-mobile.png",
            md: "/images/space-ui.png",
          })}
          alt="Home"
          shadow="dark-lg"
          pos="relative"
        />
      </Box>

      <Box h="300px" bg={useColorModeValue("blue.400", "blue.800")} pb="20px" />

      <Box
        bg={useColorModeValue("blue.400", "blue.800")}
        as="section"
        pt="240px"
        pb="240px"
        px={6}
      >
        <Box maxW="1200px" mx="auto" textAlign="center" mb="56px">
          <Heading
            mb="5"
            fontSize={["3rem", "4rem"]}
            color={useColorModeValue("white", "gray.100")}
          >
            How is floatingfile different?
          </Heading>
          <Text
            color={useColorModeValue("white", "gray.100")}
            fontSize="xl"
            mb={6}
          >
            floatingfile is a file sharing platform that marries the flexibility
            of file storage with the convenience of file transfer applications.
          </Text>
          <Grid
            gap={6}
            templateColumns={{
              base: "repeat(1, 1fr)",
              md: "repeat(2, 1fr)",
              xl: "repeat(4, 1fr)",
            }}
          >
            <Feature icon={CgTrashEmpty} title="Clutter Free">
              Keep your inboxes and chat histories clear of temporary files.
            </Feature>
            <Feature icon={FaUserSecret} title="No Accounts">
              Use floatingfile to the fullest on any device and anywhere,
              completely login free.
            </Feature>
            <Feature icon={MdGroup} title="Collaborative">
              Anyone in the space can contribute files. Perfect for group work.
            </Feature>
            <Feature icon={IoSpeedometerOutline} title="Fast">
              Join with a 6 character code or by scanning a QR code. Reduce your
              file transfer workflow to seconds.
            </Feature>
          </Grid>
        </Box>
      </Box>

      <Box py="240px" as="section" px={6}>
        <Box maxW="960px" mx="auto">
          <Text fontSize={["3rem", "4rem"]}>
            To date, floatingfile has helped{" "}
            <chakra.span color="blue.500" fontWeight="bold">
              500+
            </chakra.span>{" "}
            people transfer{" "}
            <chakra.span color="blue.500" fontWeight="bold">
              9000+
            </chakra.span>{" "}
            files in{" "}
            <chakra.span color="blue.500" fontWeight="bold">
              14
            </chakra.span>{" "}
            months.
          </Text>
        </Box>
      </Box>

      <Footer />
    </>
  );
};

export default Home;
