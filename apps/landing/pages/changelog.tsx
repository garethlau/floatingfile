import { NextSeo } from "next-seo";
import Footer from "components/footer";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import marked from "marked";
import NavigationBar from "components/navigation-bar";
import PageTitle from "components/page-title";
import { Box, Container, Text, Divider } from "@chakra-ui/react";
import Markdown from "components/Markdown";
import React from "react";

interface ChangelogRecord {
  version: string;
  data: any;
  htmlString: string;
}

const ChangelogPage: React.FC<{ changelog: ChangelogRecord[] }> = ({
  changelog,
}) => {
  return (
    <>
      <NextSeo
        title={"floatingfile | Changelog"}
        description={"Stay up-to-date on changes to floatingfile."}
        openGraph={{
          url: "https://www.floatingfile.space/changelog",
          title: "floatingfile | Changelog",
          description: "Stay up-to-date on changes to floatingfile.",
        }}
      />
      <NavigationBar />
      <PageTitle>Changelog</PageTitle>

      <Container maxW="3xl">
        {changelog.map(({ version, data, htmlString }) => (
          <React.Fragment key={version}>
            <Box id={version}>
              <Text as="i">
                {version} - {data.date}
              </Text>
              <Markdown htmlString={htmlString} />
            </Box>
            <Divider my={10} />
          </React.Fragment>
        ))}
      </Container>

      <Footer />
    </>
  );
};

export async function getStaticProps() {
  const filenames = fs.readdirSync(path.join("src", "content", "changelog"));
  const changelog = filenames
    .map((filename) => {
      const rawMd = fs.readFileSync(
        path.join("src", "content", "changelog", filename)
      );
      const parsedMd = matter(rawMd);
      const htmlString = marked(parsedMd.content);

      return {
        version: "v" + filename.replace(".md", ""),
        data: parsedMd.data,
        htmlString,
        filename,
      };
    })
    .filter((change) => !change.data.WIP);

  changelog
    .sort((a, b) =>
      a.version
        .replace(/\d+/g, (n) => (+n + 100000).toString())
        .localeCompare(
          b.version.replace(/\d+/g, (n) => (+n + 100000).toString())
        )
    )
    .reverse();

  return {
    props: {
      changelog,
    },
  };
}

export default ChangelogPage;
