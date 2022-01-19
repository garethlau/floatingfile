import React from "react";
import { Icon } from "@chakra-ui/react";
import {
  SiHtml5,
  SiC,
  SiSvg,
  SiCplusplus,
  SiCss3,
  SiXaml,
  SiHaskell,
  SiMicrosoftword,
  SiMicrosoftexcel,
  SiMicrosoftpowerpoint,
  SiJavascript,
  SiMarkdown,
  SiJava,
  SiTypescript,
  SiR,
  SiCsharp,
  SiPython,
  SiPhp,
  SiReact,
  SiRuby,
  SiKotlin,
  SiSwift,
} from "react-icons/si";
import { AiOutlineFileUnknown } from "react-icons/ai";
import { VscJson, VscFilePdf } from "react-icons/vsc";
import { GrImage, GrDocumentTxt, GrDocumentZip } from "react-icons/gr";
import { MdGif } from "react-icons/md";

function getIcon(extension: string) {
  switch (extension) {
    case "c":
      return SiC;
    case "cpp":
      return SiCplusplus;
    case "cs":
      return SiCsharp;
    case "ts":
      return SiTypescript;
    case "java":
      return SiJava;
    case "rb":
      return SiRuby;
    case "md":
      return SiMarkdown;
    case "kt":
    case "kts":
    case "ktm":
      return SiKotlin;
    case "php":
      return SiPhp;
    case "hs":
      return SiHaskell;
    case "r":
      return SiR;
    case "svg":
      return SiSvg;
    case "png":
    case "ico":
    case "jpg":
    case "jpeg":
    case "heic":
      return GrImage;
    case "json":
      return VscJson;
    case "pdf":
      return VscFilePdf;
    case "txt":
      return GrDocumentTxt;
    case "xml":
    case "xaml":
      return SiXaml;
    case "xlsx":
    case "xls":
      return SiMicrosoftexcel;
    case "docx":
    case "doc":
      return SiMicrosoftword;
    case "pptx":
    case "ppt":
      return SiMicrosoftpowerpoint;
    case "js":
      return SiJavascript;
    case "py":
      return SiPython;
    case "html":
      return SiHtml5;
    case "zip":
      return GrDocumentZip;
    case "swift":
      return SiSwift;
    case "css":
      return SiCss3;
    case "gif":
      return MdGif;
    case "jsx":
    case "tsx":
      return SiReact;
    default:
      return AiOutlineFileUnknown;
  }
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
      as={getIcon(extension)}
      w="38px"
      h="38px"
      mt="5px"
      opacity={0.75}
      style={{ marginTop: "5px", opacity: 0.75 }}
    />
  );
};

export default FileIcon;
