import React from "react";
import {
  chakra,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";

export type MarkdownProps = {
  htmlString: string;
};

const Markdown: React.FC<MarkdownProps> = ({ htmlString }) => {
  return (
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
        p: { textAlign: "justify", mt: 2 },
        a: {
          color: useColorModeValue("blue.400", "cyan.200"),
          transition: "color ease 0.3s",
        },
        "a:hover": {
          color: useColorModeValue("blue.600", "cyan.500"),
        },
        table: {
          border: "1px solid",
          borderColor: useColorModeValue("blue.200", "gray.50"),
          margin: "10px auto",
          tableLayout: "fixed",
          overflow: "auto",
          borderCollapse: "collapse",
          width: "100%",
          display: "inline-table",
        },
        th: {
          backgroundColor: useColorModeValue("blue.200", "blue.800"),
          padding: "10px",
          minWidth: "50px",
        },
        td: {
          padding: "5px",
        },
        tr: {
          "&:nth-of-type(even)": {
            backgroundColor: useColorModeValue("blue.50", "gray.700"),
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
          mb: "10px",
        },
        blockquote: {
          my: "10px",
          pl: "10px",
          fontStyle: "italic",
          borderLeftColor: "blue.300",
          borderLeftStyle: "solid",
          borderLeftWidth: "5px",
        },
        "pre > code": {
          fontFamily: "monospace",
          backgroundColor: useColorModeValue("gray.50", "gray.800"),
          borderRadius: "5px",
          display: "block",
          padding: "20px",
          fontSize: "14px",
          overflowX: "auto",
        },
        "p > code": {
          color: useColorModeValue("white", "black"),
          bg: useColorModeValue("gray.600", "gray.50"),
          px: "5px",
          py: "2px",
          borderRadius: "3px",
          fontSize: "14px",
        },
      }}
      dangerouslySetInnerHTML={{ __html: htmlString }}
    />
  );
};

export default Markdown;
