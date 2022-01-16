import Footer from "components/footer";
import NavigationBar from "components/navigation-bar";
import { NextSeo } from "next-seo";
import React from "react";
import {
  Box,
  Heading,
  useColorModeValue,
  Container,
  Text,
  Stack,
  chakra,
} from "@chakra-ui/react";
import { NextPage } from "next";
import PageTitle from "components/page-title";
import { getPaths, parseMd } from "src/utils/markdown";
import path from "path";
import Link from "next/link";
import { calcReadTime } from "src/utils/article";

interface Article {
  title: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  readTime: string;
}

const EngineeringPage: NextPage<{ articles: Article[] }> = ({ articles }) => {
  return (
    <>
      <NextSeo />
      <NavigationBar />

      <Container maxW="container.md" mb={12}>
        <PageTitle>Engineering Articles</PageTitle>

        <Stack spacing={6}>
          {articles.map((article) => (
            <Link href={`/engineering/${article.slug}`} key={article.slug}>
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
                <Text>
                  Posted {article.createdAt}, modified: {article.updatedAt}
                </Text>
              </Box>
            </Link>
          ))}
        </Stack>
      </Container>

      <Footer />
    </>
  );
};

const FOLDER_PATH = path.join("src", "content", "engineering");
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
