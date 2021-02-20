import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { NextSeo } from "next-seo";

import { useRouter } from "next/router";
import styles from "../styles/faq.module.css";

import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";

import Icon from "@mdi/react";
import { mdiMenuDown } from "@mdi/js";

import { faqs } from "../scaffold";

export default function FaqPage() {
  const router = useRouter();
  const [active, setActive] = useState(-1);
  useEffect(() => {
    if (router.query.active) {
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
      <NavBar />
      <div className={styles.root}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>FAQ</h1>
          <p>Get your questions answered</p>
        </div>
        <div className={styles.contentContainer}>
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
                  <h3 className={styles.question}>{x.q}</h3>
                </AccordionSummary>
                <AccordionDetails>
                  <p className={styles.answer}>{x.a}</p>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </div>
      </div>
      <Footer />
    </>
  );
}
