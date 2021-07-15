import React from "react";
import {
  Box,
  Image,
  Link,
  chakra,
  Flex,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { RiAppleFill } from "react-icons/ri";

const STORES = {
  apple: {
    logo: "apple-logo.svg",
    url: "https://itunes.apple.com/app/id1507080982",
    subtitle: "Download on the",
    name: "App Store",
  },
  google: {
    logo: "google-play-store.svg",
    url: "",
    subtitle: "GET IT ON",
    name: "Google Play",
  },
};
interface InstallAppButtonProps {
  store: "apple" | "google";
  disabled?: boolean;
}
const InstallAppButton: React.FC<InstallAppButtonProps> = ({
  store,
  disabled = false,
}) => {
  const textColor = useColorModeValue("white", "black");
  const bgColor = useColorModeValue("black", "white");
  return (
    <Link
      href={STORES[store].url}
      isExternal
      _hover={{ textDecoration: "none" }}
    >
      <Flex
        align="center"
        bg={bgColor}
        shadow="md"
        py="5px"
        px="10px"
        borderRadius="md"
        opacity={disabled ? 0.6 : 1}
        // _hover={{ cursor: "pointer" }}
        transition="background ease 0.3s"
        userSelect="none"
        w="fit-content"
      >
        {store === "apple" ? (
          <Icon mr="7px" as={RiAppleFill} color={textColor} h="32px" w="32px" />
        ) : (
          <Image mr="7px" h="32px" src={`/logos/${STORES[store].logo}`} />
        )}
        <Box>
          <chakra.p opacity={0.7} fontSize="12px" color={textColor}>
            {STORES[store].subtitle}
          </chakra.p>
          <chakra.p fontWeight="bold" color={textColor}>
            {STORES[store].name}
          </chakra.p>
        </Box>
      </Flex>
    </Link>
  );
};

export default InstallAppButton;
