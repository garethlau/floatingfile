import fs from "fs";
import path from "path";
import { NextSeo } from "next-seo";
import styles from "../styles/slug.module.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import * as matter from "gray-matter";
import marked from "marked";
import Icon from "@mdi/react";
import { mdiLock, mdiFileDocument } from "@mdi/js";
import { motion } from "framer-motion";

export default function Post({ data, htmlString }) {
  function renderIcon(iconType) {
    switch (iconType) {
      case "mdiLock":
        return <Icon path={mdiLock} size={"42px"} className={styles.icon} />;
      case "mdiFileDocument":
        return (
          <Icon path={mdiFileDocument} size="42px" className={styles.icon} />
        );
      default:
        return null;
    }
  }

  return (
    <>
      <NextSeo
        title={data.seo_title}
        description={data.seo_description}
        canonical={data.seo_url}
        openGraph={{
          url: data.seo_url,
          title: data.seo_title,
          description: data.seo_description,
        }}
      />
      <div className={styles.root}>
        <NavBar />
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
          <div className={styles.content}>
            <div className={styles.page}>
              <div className={styles.iconContainer}>
                {renderIcon(data.iconType)}
              </div>
              <h1 className={styles.title}>{data.title}</h1>
              <p className={styles.datetime}>
                Last Updated: {data.lastUpdated}
              </p>

              <div
                className={styles.main}
                dangerouslySetInnerHTML={{ __html: htmlString }}
              />
            </div>
          </div>
        </motion.div>

        <div style={{ marginTop: "50px" }}>
          <Footer />
        </div>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const filenames = fs.readdirSync("posts");
  const paths = filenames.map((filename) => ({
    params: { slug: filename.replace(".md", "") },
  }));
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { slug } }) {
  const rawMd = fs.readFileSync(path.join("posts", slug + ".md"));
  const parsedMd = matter(rawMd);
  const htmlString = marked(parsedMd.content);

  return {
    props: {
      data: parsedMd.data,
      htmlString,
    },
  };
}
