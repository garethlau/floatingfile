import fs from "fs";
import path from "path";
import { NextSeo } from "next-seo";
import matter from "gray-matter";
import marked from "marked";
import React from "react";
import {
  Box,
  Text,
  chakra,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";
import Footer from "components/_Footer";
import NavigationBar from "components/navigation-bar";

const Post: React.FC<{
  data: any;
  htmlString: string;
}> = ({ data, htmlString }) => {
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
      <NavigationBar />

      <Box bg={useColorModeValue("gray.100", "gray.700")}>
        <Box px={4} py="120px">
          <Box
            maxW="960px"
            mx="auto"
            bg={useColorModeValue("white", "black")}
            py={16}
            px={14}
            borderRadius="md"
            shadow="lg"
          >
            <Heading>{data.title}</Heading>
            <Text mb={4}>Last Updated: {data.lastUpdated}</Text>

            <chakra.div
              sx={{
                h1: {
                  fontSize: "2rem",
                  fontWeight: "bold",
                },
                h2: {
                  fontSize: "1.75rem",
                  fontWeight: "bold",
                },
                h3: {
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                },
                p: {
                  mb: 2,
                  color: useColorModeValue("black", "white"),
                  textAlign: "justify",
                },
                ul: {
                  pl: "20px",
                },
              }}
              dangerouslySetInnerHTML={{ __html: htmlString }}
            />
          </Box>
        </Box>
      </Box>

      <Footer />
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
