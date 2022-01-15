import fs from "fs";
import matter from "gray-matter";
import marked from "marked";
import hljs from "highlight.js";
import path from "path";
import "highlight.js/styles/github.css";

export async function getPaths(folderPath: string) {
  const filenames = fs.readdirSync(folderPath);
  const paths = filenames.map((filename) => ({
    params: {
      slug: filename.replace(".md", ""),
    },
  }));
  return paths;
}

export function parseMd(filePath: string) {
  const rawMd = fs.readFileSync(filePath);
  const parsedMd = matter(rawMd);
  marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function (code, language) {
      const validLanguage = hljs.getLanguage(language) ? language : "plaintext";
      return hljs.highlight(validLanguage, code).value;
    },
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false,
  });

  const htmlString = marked(parsedMd.content);

  return {
    data: parsedMd.data,
    htmlString,
  };
}
