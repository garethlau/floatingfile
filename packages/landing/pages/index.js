import Head from "next/head";
import { NextSeo } from "next-seo";
import styles from "../styles/index.module.css";
import Container from "../components/Container";
import Center from "../components/Center";
import AppStoreBtn from "../components/AppStoreBtn";
import GooglePlayStoreBtn from "../components/GooglePlayStoreBtn";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import HighlightFeatures from "../components/HighlightFeatures";
import OpenAppBtn from "../components/OpenAppBtn";
import Scrollable from "../components/Scrollable";
import { motion } from "framer-motion";
import EnterInView from "../wrappers/EnterInView";

export default function Home() {
  return (
    <div>
      <NextSeo title={"floatingfile"} />
      <Head></Head>
      <NavBar />
      <div
        style={{
          backgroundColor: "#4560f6",
          height: "300px",
          width: "100vw",
          position: "fixed",
          top: 0,
          zIndex: "-10",
        }}
      ></div>
      <main className={styles.main}>
        <div className={styles.hero}>
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
              <img src="/floatingfile-white.png" style={{ width: "64px" }} />
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
              <OpenAppBtn />
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
                  className={styles.landingImg}
                  src="/images/space-ui.png"
                  alt="Home"
                />
              </picture>
            </div>

            <div style={{ textAlign: "center", marginTop: "30px" }}>
              <picture>
                <img
                  className={styles.landingImgMobile}
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
            <HighlightFeatures />
          </EnterInView>
        </div>

        <div style={{ backgroundColor: "#34448E" }}>
          <Container>
            <div className={styles.mobileBanner}>
              <Center>
                <h2 style={{ color: "white" }}>
                  Get floatingfile for your mobile device
                </h2>
              </Center>
              <div className={styles.downloadBtnContainer}>
                <Center>
                  <EnterInView>
                    <AppStoreBtn />
                  </EnterInView>
                </Center>
                <Center>
                  <EnterInView>
                    <GooglePlayStoreBtn />
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
}
