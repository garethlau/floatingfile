import React from "react";
import {
  mdiMicrosoftWord,
  mdiMicrosoftPowerpoint,
  mdiMicrosoftExcel,
  mdiImageOutline,
  mdiCodeJson,
  mdiLanguageJavascript,
  mdiLanguageHtml5,
  mdiLanguagePython,
  mdiFilePdfOutline,
  mdiFileDocumentOutline,
  mdiFileQuestionOutline,
  mdiFolderZipOutline,
  mdiSvg,
  mdiLanguageSwift,
  mdiLanguageCss3,
  mdiGif,
  mdiLanguageC,
  mdiLanguageCpp,
  mdiLanguageCsharp,
  mdiLanguageGo,
  mdiLanguageHaskell,
  mdiLanguageTypescript,
  mdiLanguageJava,
  mdiLanguageKotlin,
  mdiLanguageMarkdown,
  mdiLanguagePhp,
  mdiLanguageR,
  mdiLanguageRuby,
  mdiLanguageXaml,
} from "@mdi/js";
import Icon from "@mdi/react";

function getPath(extension: string) {
  let path = mdiFileQuestionOutline;
  switch (extension) {
    case "c":
      path = mdiLanguageC;
      break;
    case "cpp":
      path = mdiLanguageCpp;
      break;
    case "cs":
      path = mdiLanguageCsharp;
      break;
    case "go":
      path = mdiLanguageGo;
      break;
    case "ts":
      path = mdiLanguageTypescript;
      break;
    case "java":
      path = mdiLanguageJava;
      break;
    case "rb":
      path = mdiLanguageRuby;
      break;
    case "xml":
      path = mdiLanguageXaml;
      break;
    case "md":
      path = mdiLanguageMarkdown;
      break;
    case "kt":
    case "kts":
    case "ktm":
      path = mdiLanguageKotlin;
      break;
    case "php":
      path = mdiLanguagePhp;
      break;
    case "hs":
      path = mdiLanguageHaskell;
      break;
    case "r":
      path = mdiLanguageR;
      break;

    case "svg":
      path = mdiSvg;
      break;
    case "png":
    case "ico":
    case "jpg":
    case "jpeg":
    case "heic":
      path = mdiImageOutline;
      break;
    case "json":
      path = mdiCodeJson;
      break;
    case "pdf":
      path = mdiFilePdfOutline;
      break;
    case "txt":
      path = mdiFileDocumentOutline;
      break;
    case "xlsx":
    case "xls":
      path = mdiMicrosoftExcel;
      break;
    case "docx":
    case "doc":
      path = mdiMicrosoftWord;
      break;
    case "pptx":
    case "ppt":
      path = mdiMicrosoftPowerpoint;
      break;
    case "mp4":
      break;
    case "js":
      path = mdiLanguageJavascript;
      break;
    case "py":
      path = mdiLanguagePython;
      break;
    case "html":
      path = mdiLanguageHtml5;
      break;
    case "zip":
      path = mdiFolderZipOutline;
      break;
    case "swift":
      path = mdiLanguageSwift;
      break;
    case "css":
      path = mdiLanguageCss3;
      break;
    case "gif":
      path = mdiGif;
      break;
    default:
      path = mdiFileQuestionOutline;
      break;
  }
  return path;
}

const FileIcon: React.FC<{
  extension: string;
  previewUrl?: string;
}> = ({ extension, previewUrl }) => {
  if (previewUrl) {
    return (
      <img
        alt="File preview"
        src={`${previewUrl}`}
        style={{ width: "80%", marginTop: "5px", borderRadius: "5px" }}
      />
    );
  }
  return (
    <Icon
      path={getPath(extension)}
      size="42px"
      style={{ marginTop: "5px", opacity: 0.75 }}
    />
  );
};

export default FileIcon;
