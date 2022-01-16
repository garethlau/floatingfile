import React from "react";
import { NextSeo } from "next-seo";
import PageTitle from "components/page-title";
import NavigationBar from "components/navigation-bar";
import {
  Box,
  Container,
  Stack,
  Heading,
  Text,
  Code,
  UnorderedList,
  ListItem,
  Link,
} from "@chakra-ui/react";
import Footer from "components/footer";

const CodeBlock: React.FC<{ htmlString?: string }> = ({
  children,
  htmlString,
}) =>
  htmlString ? (
    <Code w="100%" p={2} dangerouslySetInnerHTML={{ __html: htmlString }} />
  ) : (
    <Code w="100%" p={2}>
      {children}
    </Code>
  );

const docs = [
  {
    name: "Create space",
    command: "create",
  },
  {
    name: "Destroy space",
    command: "destroy",
    options: [
      {
        name: "-c, --code",
        type: "string",
        description:
          "Code of the space to destroy. If no code is provided, will fallback to the most recently accessed space if available.",
      },
    ],
  },
  {
    name: "List recently accessed spaces",
    command: "spaces",
    options: [
      {
        name: "--def",
        type: "boolean",
        description:
          "Supply this flag to interactively set a new default space.",
      },
    ],
  },
  {
    name: "Upload files",
    command: "create [dir]",
    positionals: [
      {
        name: "dir",
        type: "string",
        description: "Directory to upload files from.",
      },
    ],
    options: [
      {
        name: "-c, --code",
        type: "string",
        description:
          "Code of the space to upload files to. If no code is provided, will fallback to the most recently accessed space if available.",
      },
      {
        name: "-a, --all",
        type: "boolean",
        description: "Upload all files within the directory.",
      },
    ],
    examples: [
      "$ floatingfile upload ~/Desktop/test_files/ --code=ABC123<br/>> >> floatingfile<br/>> (0) .DS_Store<br/>> (1) Screen Recording 2022-01-13 at 01.06.54.mov<br/>> (2) Screen Shot.png<br/>> Which files do you want to upload?<br/>$ 2<br/>> [========================================] 100% | 41339/41339 bytes | Screen Shot.png<br/>> <br/>> Successfully uploaded:<br/>> /Users/garethlau/Desktop/Screen Shot.png",
    ],
  },
  {
    name: "Remove files",
    command: "remove",
    options: [
      {
        name: "-c, --code",
        type: "string",
        description:
          "Code of the space to remove files from. If no code is provided, will fallback to the most recently accessed space if available.",
      },
      {
        name: "-a, --all",
        type: "boolean",
        description: "Remove all files from the space.",
      },
    ],
  },
  {
    name: "List files",
    command: "files",
    options: [
      {
        name: "-c, --code",
        type: "string",
        description:
          "Code of the space to list files from. If no code is provided, will fallback to the most recently accessed space if available.",
      },
    ],
  },
  {
    name: "Download files",
    command: "download [dir]",
    positionals: [
      {
        name: "dir",
        type: "string",
        description:
          "Directory to download files to. If not provided, will fallback to default download directory. See config.",
      },
    ],
    options: [
      {
        name: "-c, --code",
        type: "string",
        description:
          "Code of the space to download from. If no code is provided, will fallback to the most recently accessed space if available.",
      },
      {
        name: "-a, --all",
        type: "boolean",
        description: "Download all the files in the space.",
      },
    ],
    examples: [
      "$ floatingfile download ~/Downloads -a<br/>> >>> floatingfile <br/>> Are you sure you want to download all 1 files? (y/n) <br/>$ y <br/>> [========================================] 100% | 41339/41339 bytes | picture.png <br/>> <br/>> Successfully downloaded:<br/>> /Users/garethlau/Downloads/picture.png",
    ],
  },
];

const CliPage: React.FC = () => {
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
      <NavigationBar />
      <PageTitle>floatingfile CLI docs</PageTitle>
      <Container mb={12} maxW="4xl">
        <Stack spacing={4}>
          <Heading as="h1" id="installation">
            Installation
          </Heading>
          <Heading as="h2" size="lg" id="macos">
            macos
          </Heading>
          <Text>
            The easiest way to install the floatingfile CLI on macos is with
            homebrew:
          </Text>
          <CodeBlock>
            brew install garethlau/floatingfile/floatingfile
          </CodeBlock>
          <Text>
            You can see the formula and latest releases{" "}
            <Link
              color="blue"
              href="https://github.com/garethlau/homebrew-floatingfile"
            >
              here
            </Link>
            .
          </Text>

          <Heading as="h2" size="lg" id="windows">
            windows
          </Heading>
          <Text>Working on this...</Text>

          <Heading as="h2" size="lg" id="windows">
            linux
          </Heading>
          <Text>Also working on this...</Text>

          <Heading as="h1">Usage</Heading>
          <Heading as="h2" size="lg" id="commands">
            Commands
          </Heading>

          <Box>
            <UnorderedList>
              {docs.map(({ name }) => (
                <ListItem>
                  <Link href={`#${name.toLowerCase().replace(/\s/g, "-")}`}>
                    {name}
                  </Link>
                </ListItem>
              ))}
            </UnorderedList>
          </Box>

          <Stack spacing={6}>
            {docs.map(({ name, command, options, positionals, examples }) => (
              <Stack spacing={4}>
                <Heading
                  as="h3"
                  size="md"
                  id={name?.toLowerCase().replace(/\s/g, "-")}
                >
                  {name}
                </Heading>
                <Box>
                  <Code>floatingfile {command}</Code>
                </Box>
                {positionals?.length > 0 && (
                  <Box>
                    <Text>Positionals:</Text>
                    <UnorderedList>
                      {positionals.map(({ name, type, description }) => (
                        <ListItem>
                          <Code>{name}</Code> - {description} [{type}]
                        </ListItem>
                      ))}
                    </UnorderedList>
                  </Box>
                )}
                {options?.length > 0 && (
                  <Box>
                    <Text>Options:</Text>
                    <UnorderedList>
                      {options.map(({ name, type, description }) => (
                        <ListItem>
                          <Code>{name}</Code> - {description} [{type}]
                        </ListItem>
                      ))}
                    </UnorderedList>
                  </Box>
                )}
                {examples?.length > 0 && (
                  <Box>
                    {examples.map((example) => (
                      <CodeBlock htmlString={example} />
                    ))}
                  </Box>
                )}
              </Stack>
            ))}
          </Stack>

          <Heading as="h2" size="lg">
            Configurations
          </Heading>
          <Heading as="h3" size="md">
            Available configurations
          </Heading>
          <Box>
            <UnorderedList>
              <ListItem>
                <Code>username</Code> - The username other users will see you
                as. By default, this is set to <Code>CLI</Code>
              </ListItem>
              <ListItem>
                <Code>download_to</Code> - Default path to download files to. By
                default, this is set to <Code>Downloads</Code>
              </ListItem>
              <ListItem>
                <Code>group_by_space</Code> - If set to <Code>Yes</Code>,
                downloaded files will be placed into a directory with the
                space's code as the name. By default, this is set to{" "}
                <Code>No</Code>
              </ListItem>
            </UnorderedList>
          </Box>

          <Heading as="h3" size="md">
            Read a property
          </Heading>
          <Text>
            To read a specific property, supply the field name. For example:
          </Text>

          <CodeBlock>
            $ floatingfile config username
            <br />
            &gt; username=CLI
          </CodeBlock>
          <Text>
            To view all values, supply the <code>-l</code> flag:
          </Text>
          <CodeBlock>
            $ floatingfile config -l
            <br />
            &gt; username=CLI
            <br />
            &gt; download_to=Downloads
            <br />
            &gt; group_by_space=No
            <br />
          </CodeBlock>

          <Heading as="h3" size="md">
            Update a property
          </Heading>
          <Text>
            To update a property, supply the field name <b>and the new value</b>
            . For example:
          </Text>
          <CodeBlock>$ floatingfile config username my-new-username</CodeBlock>
        </Stack>
      </Container>
      <Footer />
    </>
  );
};

export default CliPage;
