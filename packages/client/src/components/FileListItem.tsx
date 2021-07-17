import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Colors, Elevation } from "@floatingfile/common";
import Button from "./Button";
import GIconButton from "./GIconButton";
import Center from "./Center";
import useWindowWidth from "../hooks/useWindowWidth";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import DeleteIcon from "@material-ui/icons/Delete";
import OpenInBrowserIcon from "@material-ui/icons/OpenInBrowser";
import { isMobile } from "react-device-detect";
import useRemoveFile from "../mutations/useRemoveFile";
import { useParams } from "react-router-dom";
import { useSelectedFiles } from "../contexts/selectedFiles";
import axios from "axios";
import { saveBlob } from "../utils";
import { BASE_API_URL } from "../env";
import { File } from "@floatingfile/types";
import FileIcon from "./FileIcon";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "grid",
    gridTemplateRows: "64px",
    gridTemplateAreas: "'icon text remove download'",
    gridTemplateColumns: "64px auto 55px 55px",
    [theme.breakpoints.up("sm")]: {
      // gridTemplateAreas: "'icon text remove download'",
      gridTemplateColumns: "64px auto 85px 115px",
      "&:hover": {
        boxShadow: Elevation.TWO,
      },
    },
    padding: "0px 10px 0px 0px",
    boxShadow: Elevation.ONE,
    margin: "10px 10px",
    borderRadius: "5px",
    transition: "ease 0.3s",
  },
  inactive: {
    borderRadius: "50%",
    borderColor: Colors.MAIN_BRAND,
    borderStyle: "solid",
    width: "24px",
    height: "24px",
    margin: "auto",
  },
  active: {
    borderRadius: "50%",
    backgroundColor: Colors.MAIN_BRAND,
    borderColor: Colors.MAIN_BRAND,
    borderStyle: "solid",
    width: "24px",
    height: "24px",
    margin: "auto",
  },
  select: {
    gridArea: "select",
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "inherit",
      "&:hover": {
        cursor: "pointer",
      },
    },
  },
  icon: {
    gridArea: "icon",
    [theme.breakpoints.up("sm")]: {
      "&:hover": {
        cursor: "pointer",
      },
    },
  },
  text: {
    gridArea: "text",
    [theme.breakpoints.up("sm")]: {
      "&:hover": {
        cursor: "pointer",
      },
    },
  },

  remove: {
    gridArea: "remove",
    [theme.breakpoints.up("sm")]: {
      "&:hover": {
        cursor: "pointer",
      },
    },
  },
  download: {
    gridArea: "download",
    [theme.breakpoints.up("sm")]: {
      "&:hover": {
        cursor: "pointer",
      },
    },
  },
  loadingContainer: {
    display: "grid",
    gridTemplateRows: "64px",
    gridTemplateColumns: "64px auto",
    padding: "0px 10px 0px 0px",
    boxShadow: Elevation.ONE,
    margin: "10px 10px",
    borderRadius: "5px",
    transition: "ease 0.3s",
    cursor: "not-allowed",
    backgroundColor: Colors.WHITE,
  },
}));

const FileListItem: React.FC<{ file: File }> = ({ file }) => {
  const { name, type, key, ext, size, signedUrl } = file;
  const { code }: { code: string } = useParams();
  const windowWidth: number = useWindowWidth();
  const cls = useStyles();
  const { mutateAsync: removeFile } = useRemoveFile(code);
  const { toggleSelect, isSelected } = useSelectedFiles();
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  async function download(): Promise<void> {
    if (isMobile) {
      window.open(signedUrl, "_blank");
    } else {
      try {
        setIsDownloading(true);
        if (!signedUrl) return;
        const response = await axios.get(signedUrl, {
          responseType: "blob",
          onDownloadProgress: (event) => {
            setDownloadProgress(event.loaded / event.total);
          },
        });
        const { data } = response;
        await saveBlob(data, name);
        await axios.patch(`${BASE_API_URL}/api/v5/spaces/${code}/history`, {
          action: "DOWNLOAD_FILE",
          payload: key,
        });
        console.log("Succesfully downloaded ", name);
      } catch (error) {
        console.error(error);
      } finally {
        setIsDownloading(false);
      }
    }
  }

  async function remove(): Promise<void> {
    try {
      await removeFile(key);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div
      className={cls.root}
      style={{ backgroundColor: isSelected(key) ? "#DDE8F8" : Colors.WHITE }}
    >
      <div className={cls.icon} onClick={() => toggleSelect(key)}>
        <Center>
          <FileIcon extension={ext} previewUrl={file.previewUrl} />
        </Center>
      </div>
      <div
        style={{ marginTop: "10px", minWidth: 0 }}
        className={cls.text}
        onClick={() => toggleSelect(key)}
      >
        <p
          style={{
            margin: 0,
            fontWeight: 500,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </p>
        <p
          style={{
            margin: 0,
            opacity: 0.7,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {!isNaN(size / 1000)
            ? size > 1000000
              ? `${(size / (1024 * 1024)).toFixed(1)} MB`
              : `${(size / 1024).toFixed(1)} KB`
            : ""}
        </p>
      </div>
      <div className={cls.remove}>
        <Center>
          {windowWidth > 600 ? (
            <Button
              event={{ category: "File", action: "Removed a File" }}
              variant="primary"
              debounce={5}
              onClick={remove}
            >
              Remove
            </Button>
          ) : (
            <GIconButton
              event={{ category: "File", action: "Removed a File" }}
              onClick={remove}
              variant="primary"
              debounce={10}
            >
              <DeleteIcon />
            </GIconButton>
          )}
        </Center>
      </div>
      <div className={cls.download}>
        <Center>
          {windowWidth > 600 ? (
            <Button
              event={{ category: "File", action: "Downloaded a File" }}
              onClick={download}
              variant="primary"
              debounce={5}
              disabled={isDownloading}
            >
              <span style={{ opacity: isDownloading ? 0 : 1 }}>Download</span>
              <span
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                {isDownloading && (downloadProgress * 100).toFixed(1) + "%"}
              </span>
            </Button>
          ) : (
            <GIconButton
              event={{ category: "File", action: "Downloaded a File" }}
              onClick={download}
              variant="primary"
              debounce={2}
            >
              {isMobile ? <OpenInBrowserIcon /> : <CloudDownloadIcon />}
            </GIconButton>
          )}
        </Center>
      </div>
    </div>
  );
};

export default FileListItem;
