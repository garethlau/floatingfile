import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  useDisclosure,
  Spacer,
  Stack,
  chakra,
  useColorMode,
  useColorModeValue,
  useBreakpointValue,
  Container,
} from "@chakra-ui/react";
import { FaMoon, FaSun } from "react-icons/fa";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { useViewportScroll } from "framer-motion";
import { DiGithubBadge } from "react-icons/di";
import SvgLogo from "components/logo";

const LINKS = [
  {
    label: "Changelog",
    href: "/changelog",
  },
  {
    label: "Download",
    href: "/download",
  },
];

const NavLink = ({ children, href }) => (
  <Link
    px={2}
    py={1}
    _focus={{ outline: "none" }}
    rounded={"md"}
    color="white"
    fontWeight="bold"
    href={href}
  >
    {children}
  </Link>
);

const Logo = () => (
  <Flex>
    <Box mr="10px">
      <SvgLogo width="24px" height="24px" fill="#FFFFFF" />
    </Box>
    <chakra.p
      display={useBreakpointValue({ base: "none", sm: "inherit" })}
      _hover={{ textDecoration: "none" }}
      color="white"
      fontWeight="bold"
    >
      floatingfile
    </chakra.p>
  </Flex>
);

const NavigationBar: React.FC = () => {
  const ref = useRef<HTMLHeadingElement>();
  const [y, setY] = useState(0);
  const { height = 0 } = ref.current?.getBoundingClientRect() ?? {};

  const { toggleColorMode: toggleMode } = useColorMode();
  const text = useColorModeValue("dark", "light");
  const SwitchIcon = useColorModeValue(FaMoon, FaSun);

  const { scrollY } = useViewportScroll();
  useEffect(() => {
    return scrollY.onChange(() => setY(scrollY.get()));
  }, [scrollY]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <chakra.header
      ref={ref}
      shadow={y > height ? "md" : undefined}
      transition="box-shadow 0.2s, background-color 0.2s"
      pos="sticky"
      top="0"
      zIndex="3"
      left="0"
      right="0"
      width="full"
    >
      <Box boxShadow="lg" bg="blue.500" px={4}>
        <Container maxW="6xl">
          <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
            <HStack spacing={8} alignItems={"center"}>
              <Box>
                <Link href="/" _hover={{ textDecoration: "none" }}>
                  <Logo />
                </Link>
              </Box>
            </HStack>
            <Spacer />
            <Flex alignItems={"center"}>
              <HStack spacing={4} display={{ base: "none", md: "flex" }}>
                {LINKS.map(({ label, href }) => (
                  <NavLink href={href} key={label}>
                    {label}
                  </NavLink>
                ))}
              </HStack>
              <IconButton
                as="a"
                size="md"
                fontSize="xl"
                variant="ghost"
                href="https://github.com/garethlau/floatingfile"
                colorScheme="whiteAlpha"
                color="white"
                icon={<DiGithubBadge />}
                aria-label="View on Github"
              />
              <IconButton
                size="md"
                fontSize="lg"
                aria-label={`Switch to ${text} mode`}
                variant="ghost"
                color="white"
                colorScheme="whiteAlpha"
                onClick={toggleMode}
                icon={<SwitchIcon />}
              />
            </Flex>
            <IconButton
              color="white"
              bg="transparent"
              _focus={{ outline: "none" }}
              _active={{ outline: "none" }}
              _hover={{ bg: "transparent" }}
              size={"md"}
              icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
              aria-label={"Open Menu"}
              display={{ md: !isOpen ? "none" : "inherit" }}
              onClick={isOpen ? onClose : onOpen}
            />
          </Flex>

          {isOpen ? (
            <Box pb={4}>
              <Stack as={"nav"} spacing={4}>
                {LINKS.map(({ label, href }) => (
                  <NavLink key={label} href={href}>
                    {label}
                  </NavLink>
                ))}
              </Stack>
            </Box>
          ) : null}
        </Container>
      </Box>
    </chakra.header>
  );
};

export default NavigationBar;
