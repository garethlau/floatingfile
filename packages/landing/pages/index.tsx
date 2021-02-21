import Head from "next/head";
import { NextSeo } from "next-seo";
import Container from "../src/components/Container";
import Center from "../src/components/Center";
import Nav from "../src/components/Nav";
import Footer from "../src/components/Footer";
import Features from "../src/components/Features";
import AppButton from "../src/components/AppButton";
import { motion } from "framer-motion";
import EnterInView from "../src/wrappers/EnterInView";
import StoreButton from "../src/components/StoreButton";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  main: {
    marginTop: "64px",
    // backgroundColor: "#4560f6",
    backgroundColor: "#f1f3f9",
  },
  hero: {
    // color: "#FFFFFF",
    color: "#000000",
    textAlign: "center",
    paddingBottom: "30px",
    // background: "linear-gradient(180deg, #4560f6 65%, #f1f3f9 50%)",
    paddingTop: "100px",
    [theme.breakpoints.up("md")]: {
      paddingBottom: "100px",
      // background: "linear-gradient(180deg, #4560f6 65%, #f1f3f9 50%)",
    },
  },
  landingImg: {
    borderRadius: "5px",
    boxShadow: theme.shadows[3],
    width: "90%",
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "inherit",
    },
  },
  landingImgMobile: {
    width: "100%",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  cardContainer: {
    overflowX: "auto",
    whiteSpace: "nowrap",
    paddingBottom: "15px",
    textAlign: "center",
  },
  mobileBanner: {
    height: "auto",
    display: "grid",
    gridTemplateColumns: "1fr",
    gridTempalteRows: "1fr 1fr",
    padding: "20px",
    minHeight: "150px",
    [theme.breakpoints.up("md")]: {
      gridTemplateColumns: "1fr 360px",
      gridTempalteRows: "1fr",
    },
  },
  downloadBtnContainer: {
    display: "grid",
    gridGap: "10px",
    gridTemplateColumns: "1fr",
    gridTemplateRows: "1fr 1fr",
    [theme.breakpoints.up("md")]: {
      gridTemplateColumns: "1fr 1fr",
      gridTemplateRows: "1fr",
    },
  },
}));

const Home: React.FC<{}> = () => {
  const classes = useStyles();
  return (
    <div>
      <NextSeo title={"floatingfile"} />
      {/* <Head></Head> */}
      <Nav />
      <main className={classes.main}>
        <div className={classes.hero}>
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 50,
                },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: {
                    delay: 0.2,
                  },
                },
              }}
            >
              <img src="/floatingfile.png" style={{ width: "64px" }} />
              <h1 style={{ margin: 0 }}>floatingfile</h1>
            </motion.div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 50,
                },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: {
                    delay: 0.4,
                  },
                },
              }}
            >
              <h3>Simplify your file transfer workflow</h3>
            </motion.div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 50,
                },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: {
                    delay: 0.8,
                  },
                },
              }}
            >
              <AppButton />
            </motion.div>
          </Container>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {
                opacity: 0,
                y: 50,
              },
              visible: {
                y: 0,
                opacity: 1,
                transition: {
                  delay: 1.2,
                },
              },
            }}
          >
            <div style={{ textAlign: "center", marginTop: "30px" }}>
              <picture>
                <source type="image/webp" srcSet="/images/space-ui.webp" />
                <source type="image/png" srcSet="/images/space-ui.png" />
                <img
                  className={classes.landingImg}
                  src="/images/space-ui.png"
                  alt="Home"
                />
              </picture>
            </div>

            <div style={{ textAlign: "center", marginTop: "30px" }}>
              <picture>
                <img
                  className={classes.landingImgMobile}
                  src="/images/space-ui-mobile.png"
                  alt="Home"
                />
              </picture>
            </div>
          </motion.div>
        </div>

        <div style={{ backgroundColor: "#f1f3f9", padding: "10px 0" }}>
          <Container>
            <div style={{ textAlign: "center" }}>
              <h2>How is floatingfile different?</h2>
              <p
                style={{ maxWidth: "550px", margin: "auto", padding: "0 20px" }}
              >
                floatingfile is a file sharing platform that marries the
                flexibility of file storage with the convenience of file
                transfer applications.
              </p>
            </div>
          </Container>
          <EnterInView>
            <Features />
          </EnterInView>
        </div>

        <div style={{ backgroundColor: "#4560f6" }}>
          <Container>
            <div className={classes.mobileBanner}>
              <Center>
                <h2 style={{ color: "white" }}>
                  Get floatingfile for your mobile device
                </h2>
              </Center>
              <div className={classes.downloadBtnContainer}>
                <Center>
                  <EnterInView>
                    <StoreButton store="apple" />
                  </EnterInView>
                </Center>
                <Center>
                  <EnterInView>
                    <StoreButton store="google" disabled />
                  </EnterInView>
                </Center>
              </div>
            </div>
          </Container>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
