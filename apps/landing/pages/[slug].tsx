import path from "path";
import { NextSeo } from "next-seo";
import React from "react";
import { Box, Text, Heading, useColorModeValue } from "@chakra-ui/react";
import Footer from "components/footer";
import NavigationBar from "components/navigation-bar";
import Markdown from "components/Markdown";
import { getPaths, parseMd } from "src/utils/markdown";

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
            <Text mb={4}>Last Updated: {data.updatedAt}</Text>
            <Markdown htmlString={htmlString} />
          </Box>
        </Box>
      </Box>

      <Footer />
    </>
  );
};

const FOLDER_PATH = path.join("src", "content", "posts");

export async function getStaticPaths() {
  const paths = await getPaths(FOLDER_PATH);
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { slug } }) {
  const filePath = path.join(FOLDER_PATH, `${slug}.md`);

  const { data, htmlString } = parseMd(filePath);

  return {
    props: {
      data,
      htmlString,
    },
  };
}

export default Post;
