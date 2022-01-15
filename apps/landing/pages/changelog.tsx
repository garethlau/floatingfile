import { NextSeo } from "next-seo";
import Footer from "components/footer";
import EnterInView from "../src/wrappers/EnterInView";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import marked from "marked";
import NavigationBar from "components/navigation-bar";
import PageTitle from "components/page-title";
import {
  Box,
  Container,
  Text,
  chakra,
  Divider,
  useBreakpointValue,
} from "@chakra-ui/react";

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
          <EnterInView key={version}>
            <Box id={version}>
              <Text as="i">
                {version} - {data.date}
              </Text>
              <chakra.div
                sx={{
                  h1: {
                    fontSize: "3rem",
                    fontWeight: "bold",
                    mt: 4,
                  },
                  h2: {
                    fontSize: "2rem",
                    fontWeight: "bold",
                    mt: 4,
                  },
                  h3: {
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    mt: 4,
                  },
                  a: {
                    color: "blue.400",
                    transition: "color ease 0.3s",
                  },
                  "a:hover": {
                    color: "blue.600",
                  },
                  table: {
                    border: "1px solid #ddd",
                    margin: "10px auto",
                    tableLayout: "fixed",
                    overflow: "auto",
                    borderCollapse: "collapse",
                    width: "100%",
                    display: "inline-table",
                  },
                  th: {
                    backgroundColor: "blue.200",
                    padding: "5px",
                    minWidth: "50px",
                  },
                  td: {
                    padding: "5px",
                  },
                  tr: {
                    "&:nth-child(even)": {
                      backgroundColor: "blue.50",
                    },
                  },
                  img: {
                    width: useBreakpointValue({ base: "100%", md: "80%" }),
                    mx: "auto",
                    borderRadius: "md",
                    shadow: "md",
                    my: 4,
                  },
                  ul: {
                    pl: "20px",
                  },
                  p: { textAlign: "justify" },
                  blockquote: {
                    my: "10px",
                    pl: "10px",
                    fontStyle: "italic",
                    borderLeftColor: "blue.300",
                    borderLeftStyle: "solid",
                    borderLeftWidth: "5px",
                  },
                  code: {
                    bg: "gray.100",
                    px: "3px",
                  },
                }}
                dangerouslySetInnerHTML={{ __html: htmlString }}
              />
            </Box>
            <Divider my={10} />
          </EnterInView>
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
