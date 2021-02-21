import React from "react";
import Footer from "../src/components/Footer";
import Nav from "../src/components/Nav";
import StoreButton from "../src/components/StoreButton";
import { NextSeo } from "next-seo";
import { makeStyles } from "@material-ui/core/styles";
import { Colors, BoxShadows } from "../src/constants";
import { motion } from "framer-motion";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: "64px",
    backgroundColor: Colors.LIGHT_SHADE,
    minHeight: "calc(100vh - 100px)",
  },
  title: {
    textAlign: "center",
    "& > h1": {
      marginTop: "50px",
    },
    maxWidth: "960px",
    width: "90%",
    margin: "auto",
  },
  imgContainer: {
    textAlign: "center",
  },
  imgDesktop: {
    maxWidth: "960px",
    borderRadius: "10px",
    boxShadow: BoxShadows.TWO,
    width: "90%",
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "inherit",
    },
  },
  imgMobile: {
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
}));

const DownloadPage: React.FC<{}> = () => {
  const cls = useStyles();

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
      <Nav />
      <div className={cls.root}>
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
          <div className={cls.title}>
            <h1>Download</h1>
            <p>
              Get floatingfile for your iOS device for a smooth, feature-rich
              experience.
            </p>
          </div>
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
                delay: 0.5,
              },
            },
          }}
        >
          <div className={cls.imgContainer}>
            <picture>
              <source type="image/webp" srcSet={"/images/ios-app.webp"} />
              <source type="image/png" srcSet={"/images/ios-app.png"} />
              <img
                alt="Screenshots of iOS application"
                className={cls.imgDesktop}
                src={"/images/ios-app.png"}
              />
            </picture>

            <picture>
              <source type="image/webp" srcSet={"/images/space-ui-ios.webp"} />
              <source type="image/png" srcSet={"/images/space-ui-ios.png"} />
              <img
                alt="Screenshots of iOS application"
                className={cls.imgMobile}
                src={"/images/space-ui-ios.png"}
              />
            </picture>
          </div>
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
                delay: 1,
              },
            },
          }}
        >
          <div>
            <div
              style={{ margin: "auto", padding: "30px", width: "min-content" }}
            >
              <StoreButton store="apple" />
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default DownloadPage;
