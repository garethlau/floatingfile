import { NextSeo } from "next-seo";
import React from "react";
import { Box, Heading, useColorModeValue, Text, Stack } from "@chakra-ui/react";
import { NextPage } from "next";
import { getPaths, parseMd } from "utils/markdown";
import path from "path";
import Link from "next/link";
import { calcReadTime } from "utils/article";
import Page from "components/Page";

interface Article {
  title: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  readTime: string;
}

const ArticleCard: React.FC<{ article: Article }> = ({ article }) => (
  <Link passHref href={`/engineering/${article.slug}`}>
    <Box
      bg={useColorModeValue("blue.50", "blue.700")}
      as="article"
      p={6}
      borderRadius="md"
      _hover={{
        cursor: "pointer",
      }}
    >
      <Heading
        fontSize="3xl"
        color={useColorModeValue("blue.400", "gray.100")}
        as="h2"
      >
        {article.title}
      </Heading>
      <Text>{article.readTime} min read</Text>
      <Text color="gray.500">Posted {article.createdAt}</Text>
      <Text color="gray.500">Updated: {article.updatedAt}</Text>
    </Box>
  </Link>
);

const EngineeringPage: NextPage<{ articles: Article[] }> = ({ articles }) => {
  return (
    <>
      <NextSeo />
      <Page title="Engineering Notes">
        <Stack spacing={6}>
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </Stack>
      </Page>
    </>
  );
};

const FOLDER_PATH = path.join("content", "engineering");
export async function getStaticProps() {
  const paths = await getPaths(FOLDER_PATH);

  const articles = paths.map((p) => {
    const filePath = path.join(FOLDER_PATH, `${p.params.slug}.md`);
    const { data, htmlString } = parseMd(filePath);
    const readTime = calcReadTime(htmlString);

    return {
      ...data,
      slug: p.params.slug,
      readTime,
    };
  });

  return {
    props: {
      articles,
    },
  };
}

export default EngineeringPage;
