import path from "path";
import { NextSeo } from "next-seo";
import React from "react";
import {
  Box,
  Text,
  Heading,
  useColorModeValue,
  Button,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import Markdown from "components/Markdown";
import "highlight.js/styles/github.css";
import { getPaths, parseMd } from "utils/markdown";
import Page from "components/Page";

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
      <Page maxW="100vw" p={0} m={0}>
        <Box bg={useColorModeValue("gray.100", "gray.700")}>
          <Box px={4} py="120px">
            <Box
              maxW="960px"
              mx="auto"
              bg={useColorModeValue("white", "black")}
              py={16}
              px={[4, 6, 8, 14]}
              borderRadius="md"
              shadow="lg"
            >
              <Button
                variant="link"
                as="a"
                href="/engineering"
                leftIcon={<ArrowBackIcon />}
              >
                Back
              </Button>
              <Heading>{data.title}</Heading>
              <Text color="gray.500">Posted: {data.createdAt}</Text>
              <Text color="gray.500" mb={4}>
                Updated: {data.updatedAt}
              </Text>
              <Markdown htmlString={htmlString} />
            </Box>
          </Box>
        </Box>
      </Page>
    </>
  );
};

const FOLDER_PATH = path.join("content", "engineering");

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
