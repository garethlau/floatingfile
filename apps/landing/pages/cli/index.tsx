import React from "react";
import { NextSeo } from "next-seo";
import { Text, Heading, HStack, Tag } from "@chakra-ui/react";
import path from "path";
import { getPaths, parseMd } from "utils/markdown";
import Markdown from "components/Markdown";
import { NextPage } from "next";
import NextLink from "next/link";
import Page from "components/Page";

const CliPage: NextPage<{
  versions: string[];
  latest: { htmlString: string; data: any };
  installation: { htmlString: string; data: any };
}> = ({ latest, versions, installation }) => {
  return (
    <>
      <NextSeo
        title={"floatingfile | CLI"}
        description={
          "Documentation for the floatingfile command line interface"
        }
        openGraph={{
          url: "https://www.floatingfile.space/cli",
          title: "floatingfile | CLI",
          description:
            "Documentation for the floatingfile command line interface",
          images: [
            {
              url: "https://floatingfile.space/images/cli-banner-blue-1200x600.jpg",
              width: 1200,
              height: 630,
              alt: "Use floatingfile today!",
            },
          ],
          site_name: "floatingfile",
        }}
      />
      <Page title="CLI">
        <HStack>
          <Text>Releases:</Text>
          {versions.map((version, index) => (
            <React.Fragment key={version}>
              <NextLink href={`/cli/${version}`}>
                <Tag colorScheme="green" _hover={{ cursor: "pointer" }}>
                  {version} {index === 0 && "(latest)"}
                </Tag>
              </NextLink>
              {index !== versions.length - 1 && ","}
            </React.Fragment>
          ))}
        </HStack>

        <Heading mt={6}>Installation</Heading>
        <Markdown htmlString={installation.htmlString} />

        <Heading mt={6}>Commands</Heading>
        <Text>
          Version: <Tag colorScheme="green">v{versions[0]}</Tag>
        </Text>
        <Text color="gray.500">Posted: {latest.data.createdAt}</Text>
        <Text color="gray.500" mb={4}>
          Updated: {latest.data.updatedAt}
        </Text>
        <Markdown htmlString={latest.htmlString} />
      </Page>
    </>
  );
};

const FOLDER_PATH = path.join("content", "cli");
export async function getStaticProps() {
  const versions = getPaths(FOLDER_PATH)
    .filter(({ params }) => {
      if (params.slug.includes("installation")) {
        return false;
      }
      return true;
    })
    .map((p) => p.params.slug)
    .sort((a, b) => {
      return a
        .replace(/\d+/g, (n) => (+n + 100000).toString())
        .localeCompare(b.replace(/\d+/g, (n) => (+n + 100000).toString()));
    })
    .reverse();

  const latest = parseMd(path.join(FOLDER_PATH, `${versions[0]}.md`));
  const installation = parseMd(path.join(FOLDER_PATH, "installation.md"));

  return {
    props: {
      versions,
      latest,
      installation,
    },
  };
}

export default CliPage;
