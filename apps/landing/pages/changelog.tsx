import { NextSeo } from "next-seo";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { Box, Text, Divider } from "@chakra-ui/react";
import Markdown from "components/Markdown";
import React from "react";
import Page from "components/Page";

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
      <Page maxW="container.sm" title="Changelog">
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
      </Page>
    </>
  );
};

export async function getStaticProps() {
  const FOLDER_PATH = path.join("content", "changelog");
  const filenames = fs.readdirSync(FOLDER_PATH);
  const changelog = filenames
    .map((filename) => {
      const rawMd = fs.readFileSync(path.join(FOLDER_PATH, filename));
      const parsedMd = matter(rawMd);
      const htmlString = marked.parse(parsedMd.content);

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
