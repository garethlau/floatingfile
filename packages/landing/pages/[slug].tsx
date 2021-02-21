import fs from "fs";
import path from "path";
import { NextSeo } from "next-seo";
import Nav from "../src/components/Nav";
import Footer from "../src/components/Footer";
import matter from "gray-matter";
import marked from "marked";
import Icon from "@mdi/react";
import { mdiLock, mdiFileDocument } from "@mdi/js";
import { motion } from "framer-motion";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#f1f3f9",
    height: "100%",
  },
  content: {
    minHeight: "100vh",
    marginTop: "64px",
  },
  page: {
    borderRadius: "10px",
    boxShadow: theme.shadows[2],
    backgroundColor: "#FFFFFF",
    padding: "20px",
    transform: "translateY(50px)",
    maxWidth: "960px",
    margin: "auto",
    zIndex: -1,
  },
  iconContainer: {
    textAlign: "center",
    paddingTop: "20px",
  },
  icon: {
    color: "#34448e",
  },
  title: {
    textAlign: "center",
    marginBottom: 0,
  },
  datetime: {
    opacity: 0.5,
    textAlign: "center",
    marginBottom: "30px",
    marginTop: "0",
  },
  main: {
    "& p": {
      textAlign: "justify",
    },
  },
}));

const Post: React.FC<{
  data: any;
  htmlString: string;
}> = ({ data, htmlString }) => {
  const classes = useStyles();

  function renderIcon(iconType) {
    switch (iconType) {
      case "mdiLock":
        return <Icon path={mdiLock} size={"42px"} className={classes.icon} />;
      case "mdiFileDocument":
        return (
          <Icon path={mdiFileDocument} size="42px" className={classes.icon} />
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
      <div className={classes.root}>
        <Nav />
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
          <div className={classes.content}>
            <div className={classes.page}>
              <div className={classes.iconContainer}>
                {renderIcon(data.iconType)}
              </div>
              <h1 className={classes.title}>{data.title}</h1>
              <p className={classes.datetime}>
                Last Updated: {data.lastUpdated}
              </p>

              <div
                className={classes.main}
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
};

export async function getStaticPaths() {
  const filenames = fs.readdirSync(path.join("src", "content", "posts"));
  const paths = filenames.map((filename) => ({
    params: { slug: filename.replace(".md", "") },
  }));
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { slug } }) {
  const rawMd = fs.readFileSync(
    path.join("src", "content", "posts", slug + ".md")
  );
  const parsedMd = matter(rawMd);
  const htmlString = marked(parsedMd.content);

  return {
    props: {
      data: parsedMd.data,
      htmlString,
    },
  };
}

export default Post;
