import path from "path";
import { NextSeo } from "next-seo";
import React from "react";
import { Button, Container, Box, Text, Heading, Link } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import Footer from "components/footer";
import NavigationBar from "components/navigation-bar";
import Markdown from "components/Markdown";
import { NextPage } from "next";
import { getPaths, parseMd } from "src/utils/markdown";
import Page from "components/Page";

const CliDocPage: NextPage<{
  data: any;
  htmlString: string;
  slug: string;
}> = ({ data, htmlString, slug }) => {
  return (
    <>
      <NextSeo />
      <Page>
        <Box px={4} pt="80px">
          <Button
            variant="link"
            as="a"
            href="/cli"
            leftIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
          <Heading>v{slug}</Heading>
          <Text>
            URL: <Link href={data.url}>{data.url}</Link>
          </Text>
          <Text color="gray.500">Posted: {data.createdAt}</Text>
          <Text color="gray.500" mb={4}>
            Updated: {data.updatedAt}
          </Text>
          <Markdown htmlString={htmlString} />
        </Box>
      </Page>
    </>
  );
};

const FOLDER_PATH = path.join("src", "content", "cli");

export async function getStaticPaths() {
  const paths = getPaths(FOLDER_PATH);
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
      slug,
    },
  };
}

export default CliDocPage;
