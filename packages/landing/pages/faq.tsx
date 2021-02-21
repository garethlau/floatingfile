import React, { useState, useEffect } from "react";
import Nav from "../src/components/Nav";
import Footer from "../src/components/Footer";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Icon from "@mdi/react";
import { mdiMenuDown } from "@mdi/js";
import { faqs } from "../src/scaffold";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#f1f3f9",
    minHeight: "100vh",
    paddingTop: "64px",
  },
  titleContainer: {
    textAlign: "center",
  },
  title: {
    marginTop: "50px",
  },
  contentContainer: {
    padding: "0px 20px 100px",
    maxWidth: "960px",
    margin: "auto",
  },
  question: {
    opacity: 0.7,
    margin: "10px 0",
  },
  answer: {},
}));

const FaqPage: React.FC<{}> = () => {
  const router = useRouter();
  const [active, setActive] = useState<number>(-1);
  const classes = useStyles();

  useEffect(() => {
    if (router.query.active && typeof router.query.active === "string") {
      setActive(parseInt(router.query.active));
    }
  }, [router.query.active]);

  const handlePanelClick = (index) => () => {
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
      <Nav />
      <div className={classes.root}>
        <div className={classes.titleContainer}>
          <h1 className={classes.title}>FAQ</h1>
          <p>Get your questions answered</p>
        </div>
        <div className={classes.contentContainer}>
          {faqs.map((x, index) => {
            return (
              <Accordion
                key={index}
                style={{ margin: "30px 0" }}
                expanded={active === index}
              >
                <AccordionSummary
                  onClick={handlePanelClick(index)}
                  expandIcon={
                    <Icon
                      path={mdiMenuDown}
                      style={{ opacity: 0.7 }}
                      size="32px"
                    />
                  }
                >
                  <h3 className={classes.question}>{x.q}</h3>
                </AccordionSummary>
                <AccordionDetails>
                  <p className={classes.answer}>{x.a}</p>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </div>
      </div>
      <Footer />
    </>
  );
};
export default FaqPage;
