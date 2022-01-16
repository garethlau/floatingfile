import React from "react";
import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import InstallAppButton from "components/install-app-button";
import Logo from "components/logo";

const RESOURCES = [
  {
    heading: "Explore",
    links: [
      { label: "Changelog", href: "/changelog" },
      { label: "Frequently Asked Questions", href: "/faq" },
      { label: "Download", href: "/download" },
      { label: "Engineering", href: "/engineering" },
      {
        label: "Product Hunt",
        href: "https://www.producthunt.com/posts/floatingfile",
      },
    ],
  },
  {
    heading: "Developers",
    links: [
      { label: "API Documentation", href: "/docs/v4", disabled: true },
      {
        label: "Repository",
        href: "https://github.com/garethlau/floatingfile",
      },
      {
        label: "CLI",
        href: "https://github.com/garethlau/floatingfile-cli",
      },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

const ListHeader: React.FC = ({ children }) => {
  return (
    <Text fontWeight={"500"} fontSize={"lg"} mb={2}>
      {children}
    </Text>
  );
};

const Footer: React.FC = () => (
  <Box
    bg={useColorModeValue("gray.50", "gray.900")}
    color={useColorModeValue("gray.700", "gray.200")}
  >
    <Container as={Stack} maxW={"6xl"} py={10}>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
        {RESOURCES.map(({ heading, links }) => (
          <Stack align={"flex-start"} key={heading}>
            <ListHeader>{heading}</ListHeader>
            {links.map(({ label, href, disabled }) =>
              disabled ? (
                <Text as="s" key={label}>
                  {label}
                </Text>
              ) : (
                <Link href={href} key={label}>
                  {label}
                </Link>
              )
            )}
          </Stack>
        ))}

        <Stack align={"flex-start"}>
          <ListHeader>Install App</ListHeader>
          <InstallAppButton store="apple" />
          <InstallAppButton store="google" disabled />
        </Stack>
      </SimpleGrid>
    </Container>

    <Flex align="center">
      <Box
        flex="1"
        borderTopWidth={1}
        borderStyle={"solid"}
        borderColor={useColorModeValue("gray.200", "gray.700")}
      />
      <Box mx="20px">
        <Logo
          fill={useColorModeValue("var(--chakra-colors-gray-700)", "white")}
          width="32px"
          height="32px"
        />
      </Box>
      <Box
        flex="1"
        borderTopWidth={1}
        borderStyle={"solid"}
        borderColor={useColorModeValue("gray.200", "gray.700")}
      />
    </Flex>

    <Container
      as={Stack}
      maxW={"6xl"}
      py={4}
      direction={{ base: "column", md: "row" }}
      spacing={4}
      justify={{ md: "space-between" }}
      align={{ md: "center" }}
    >
      <Text>© 2022 floatingfile. All rights reserved</Text>
    </Container>
  </Box>
);

export default Footer;
