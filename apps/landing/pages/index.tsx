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
  Skeleton,
  AspectRatio,
  Link,
} from "@chakra-ui/react";
import NavigationBar from "components/navigation-bar";
import Footer from "components/footer";
import Video from "components/Video";
import NextLink from "next/link";

function monthDiff(from: Date, to: Date) {
  return (
    to.getMonth() -
    from.getMonth() +
    12 * (to.getFullYear() - from.getFullYear())
  );
}

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
              mt={[2, 4, 8]}
              justify="center"
              direction={{ base: "column", sm: "row" }}
              spacing={4}
            >
              <Button
                size="lg"
                colorScheme="blue"
                as="a"
                href="https://app.floatingfile.space"
              >
                Open floatingfile
              </Button>
              <Button
                size="lg"
                as="a"
                href="https://github.com/garethlau/floatingfile"
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
          alt=""
          borderRadius="md"
          w="90%"
          mx="auto"
          src={useBreakpointValue({
            base: "/images/space-ui-mobile.png",
            md: "/images/space-ui.png",
          })}
          shadow={useBreakpointValue({
            base: "none",
            md: "dark-lg",
          })}
          pos="relative"
          fallback={
            <AspectRatio
              pos="relative"
              w="90%"
              mx="auto"
              ratio={useBreakpointValue({ base: 0.6, md: 1.95 })}
            >
              <Box bg="gray.700" shadow="dark-lg" borderRadius="md">
                <Skeleton
                  fadeDuration={1}
                  w="100%"
                  h="100%"
                  borderRadius="md"
                />
              </Box>
            </AspectRatio>
          }
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
      <Box bg="gray.100" as="section" pt="140px" pb="60px" px={6}>
        <Box maxW="1200px" mx="auto" textAlign="center">
          <Heading mb="5" fontSize={["3rem", "4rem"]} color="gay.700">
            How do I use floatingfile?
          </Heading>
          {[
            { step: "create a space", src: "/videos/create-space.mov" },
            {
              step: "upload files you want to share",
              src: "/videos/upload-files.mov",
            },
            {
              step: "copy and send the link or use the QR code",
              src: "/videos/copy-url.mov",
            },
          ].map(({ step, src }) => (
            <React.Fragment key={step}>
              <Video
                borderRadius="md"
                boxShadow="md"
                maxW="600px"
                src={src}
                autoPlay
                muted
                loop
                mx="auto"
              />
              <Text mt={2} mb={6} color="gray.700" fontSize="md">
                {step}
              </Text>
            </React.Fragment>
          ))}
          <Text>
            Woo-hoo 🎉 That's it! Anyone with the link can now download the
            files in the space.
          </Text>
          <Button
            mt={4}
            colorScheme="blue"
            as="a"
            href="https://app.floatingfile.space"
          >
            Get Started
          </Button>
        </Box>
      </Box>

      <Box py="240px" as="section" px={6}>
        <Box maxW="960px" mx="auto">
          <Text fontSize={["3rem", "4rem"]}>
            To date, floatingfile has helped{" "}
            <chakra.span color="blue.500" fontWeight="bold">
              1000+
            </chakra.span>{" "}
            people transfer{" "}
            <chakra.span color="blue.500" fontWeight="bold">
              13000+
            </chakra.span>{" "}
            files in{" "}
            <chakra.span color="blue.500" fontWeight="bold">
              {monthDiff(new Date("Jan 1, 2020"), new Date())}
            </chakra.span>{" "}
            months.
          </Text>
        </Box>
      </Box>

      <Box bg="black" as="section" pt="140px" pb="140px" px={6}>
        <Box maxW="1200px" mx="auto">
          <Heading mb="5" fontSize={["3rem", "4rem"]} color="white">
            Got a question?
          </Heading>
          <Text color="white">
            Visit the{" "}
            <NextLink href="/faq" passHref>
              <Link fontWeight="bold" color="blue.300">
                frequently asked questions
              </Link>
            </NextLink>{" "}
            page or email us at{" "}
            <Link
              fontWeight="bold"
              color="blue.300"
              href="mailto:engineering@floatingfile.space"
            >
              engineering@floatingfile.space
            </Link>
            !
          </Text>
        </Box>
      </Box>

      <Footer />
    </>
  );
};

export default Home;
