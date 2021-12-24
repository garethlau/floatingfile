import React from "react";
import { NextSeo } from "next-seo";
import PageTitle from "components/page-title";
import NavigationBar from "components/navigation-bar";
import Footer from "components/footer";
import InstallAppButton from "components/install-app-button";

import {
  Container,
  Image,
  useBreakpointValue,
  Stack,
  Text,
} from "@chakra-ui/react";

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
      <NavigationBar />
      <PageTitle>Get floatingfile for your iOS device</PageTitle>

      <Container maxW="4xl" mb="240px">
        <Stack spacing={4} align="center">
          <Text>
            Download the floatingfile app for a native, feature-rich experience powered
            by the latest mobile technologies.
          </Text>
          <Image
            src={useBreakpointValue({
              base: "/images/space-ui-ios.png",
              md: "/images/ios-app.png",
            })}
          />
          <InstallAppButton store="apple" />
        </Stack>
      </Container>

      <Footer />
    </>
  );
};

export default IosPage;
