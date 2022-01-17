import React from "react";
import {
  Container,
  ContainerProps,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";
import NavigationBar from "./navigation-bar";
import Footer from "./footer";

export type PageContainerProps = ContainerProps & {
  title?: string;
};

const PageContainer: React.FC<PageContainerProps> = ({
  title,
  children,
  ...rest
}) => {
  const minH = title ? "calc(100vh - 300px - 200px)" : "calc(100vh - 300px)";
  const headingColor = useColorModeValue("gray.700", "white");
  return (
    <>
      <NavigationBar />
      <Container mb={12} maxW="container.md" minH={minH} {...rest}>
        {title && (
          <Heading
            textAlign="center"
            pt="80px"
            pb="40px"
            maxW="16ch"
            mx="auto"
            fontSize={{ base: "2.25rem", sm: "3rem", lg: "4rem" }}
            fontFamily="heading"
            fontWeight="extrabold"
            mb="16px"
            lineHeight="1.2"
            color={headingColor}
          >
            {title}
          </Heading>
        )}
        {children}
      </Container>
      <Footer />
    </>
  );
};

export default PageContainer;
