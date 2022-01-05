import React, { useState, useEffect } from "react";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import {
  Accordion,
  AccordionButton,
  AccordionPanel,
  AccordionItem,
  AccordionIcon,
  Box,
  Container,
  Text,
  Heading,
} from "@chakra-ui/react";
import PageTitle from "components/page-title";
import NavigationBar from "components/navigation-bar";
import Footer from "components/footer";
import { faqs } from "src/scaffold";

const FaqPage: React.FC = () => {
  const router = useRouter();
  const [active, setActive] = useState<number>(-1);

  useEffect(() => {
    if (router.query.active && typeof router.query.active === "string") {
      setActive(parseInt(router.query.active));
    }
  }, [router.query.active]);

  const handlePanelClick = (index) => {
    if (active === index) {
      setActive(-1);
    } else {
      router.push("/faq?active=" + index, undefined, { shallow: true });
      setActive(index);
    }
  };
  return (
    <>
      <NextSeo
        title={"floatingfile | FAQ"}
        description={"Frequently asked questions."}
        canonical={"https://www.floatingfile.space"}
        openGraph={{
          url: "https://www.floatingfile.space/faq",
          title: "floatingfile | FAQ",
          description: "Frequently asked questions.",
          images: [
            {
              url: "https://floatingfile.space/images/landing-banner.png",
              width: 1200,
              height: 630,
              alt: "Use floatingfile today!",
            },
          ],
          site_name: "floatingfile",
        }}
      />
      <NavigationBar />

      <PageTitle>Frequently Asked Questions</PageTitle>

      <Box mb="240px">
        <Container maxW="4xl">
          <Accordion
            index={active}
            onChange={(index) => handlePanelClick(index)}
          >
            {faqs.map(({ q, a }) => (
              <AccordionItem key={q}>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Heading size="sm" as="h2">
                        {q}
                      </Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Text>{a}</Text>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Container>
      </Box>

      <Footer />
    </>
  );
};
export default FaqPage;
