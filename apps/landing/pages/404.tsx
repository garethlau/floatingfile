import React from "react";
import { chakra, Container, Box } from "@chakra-ui/react";
import NavigationBar from "components/navigation-bar";
import Footer from "components/footer";

const Custom404: React.FC = () => {
  return (
    <>
      <NavigationBar />
      <Box minH="100vh">
        <Container my="100px">
          <chakra.p fontWeight="bold">404</chakra.p>
          <chakra.p fontSize="4rem" fontWeight="bold">
            Sorry, the page you were looking was not found
          </chakra.p>
        </Container>
      </Box>
      <Footer />
    </>
  );
};
export default Custom404;
