import React, { Suspense, useEffect, useContext, useCallback } from "react";

import FileUploadBtn from "../components/FileUploadBtn";

import MoonLoader from "react-spinners/MoonLoader";
import { useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import axios from "axios";
import { BASE_API_URL } from "../env";
import FolderIcon from "@material-ui/icons/Folder";

import useSpace from "../queries/useSpace";
import GIconButton from "./GIconButton";
import PlaylistAddCheckIcon from "@material-ui/icons/PlaylistAddCheck";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import DeleteIcon from "@material-ui/icons/Delete";
import ClearIcon from "@material-ui/icons/Clear";
import { makeStyles } from "@material-ui/core/styles";
import UploadQueue from "./UploadQueue";
import NavBar from "./NavBar";

import { AnimatePresence, motion } from "framer-motion";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import Button from "./Button";
import { Colors } from "@floatingfile/common";
import { useDropzone } from "react-dropzone";

import useWindowWidth from "../hooks/useWindowWidth";

import { saveBlob } from "../utils";

import { UploadServiceContext } from "../contexts/uploadService";
import { SelectedFilesContext } from "../contexts/selectedFiles";

import { useSnackbar } from "notistack";
import useFiles from "../queries/useFiles";

import useRemoveFiles from "../mutations/useRemoveFiles";
import FileListItem from "./FileListItem";

const useStyles = makeStyles((theme) => ({
  container: {
    height: "100%",
    width: "100%",
    backgroundColor: Colors.WHITE,
    [theme.breakpoints.up("md")]: {
      backgroundColor: Colors.LIGHT_SHADE,
    },
    flexWrap: "nowrap",
  },
  content: {
    flexGrow: 1,
    overflowY: "auto",
    overflowX: "hidden",
  },
  uploadZone: {
    width: "100%",
    height: "100%",
    "&:hover": {
      cursor: "pointer",
    },
    "&:focus": {
      outline: "none",
    },
  },

  centerWrapper: {
    display: "table",
    height: "100%",
    width: "100%",
  },
  center: {
    display: "table-cell",
    verticalAlign: "middle",
    textAlign: "center",
  },

  appBar: {
    height: "64px",
    padding: "0px 10px",
    backgroundColor: Colors.MAIN_BRAND,
  },

  left: {
    float: "left",
    height: "64px",
    width: "min-content",
    padding: "0 10px 0 0",
  },
  right: {
    float: "right",
    height: "64px",
    width: "min-content",
    margin: "0 0 0 10px",
  },
}));

interface Props {}

const FilesPanel: React.FC<Props> = ({}) => {
  const classes = useStyles();
  const windowWidth = useWindowWidth();
  const { code }: { code: string } = useParams();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const { data: files, isLoading } = useFiles(code);

  const { mutateAsync: removeFiles } = useRemoveFiles(code);

  const {
    selected,
    isSelected,
    clear: clearSelectedFiles,
    setSelected,
  } = useContext(SelectedFilesContext);

  const uploadService = useContext(UploadServiceContext);

  useEffect(() => {
    console.log("CODE", code);
    uploadService.setCode(code);
  }, [code]);

  const onDrop = useCallback(async (droppedFiles: File[]) => {
    uploadService.enqueueMany(droppedFiles);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
  });

  async function downloadSelected() {
    enqueueSnackbar(
      "Your files will start downloading shortly. Please ensure floatingfile has access to download multiple files.",
      {
        variant: "success",
        autoHideDuration: 3000,
      }
    );

    let downloadQueue = files?.filter((file) => isSelected(file.key));
    while (!!downloadQueue && downloadQueue.length > 0) {
      const file = downloadQueue.shift();
      if (!file || !file.signedUrl) return;
      const response = await axios.get(file.signedUrl, {
        responseType: "blob",
      });
      const { data } = response;
      await saveBlob(data, file.name);
      await axios.patch(`${BASE_API_URL}/api/v4/spaces/${code}/history`, {
        action: "DOWNLOAD_FILE",
        payload: file.key,
      });
    }
  }

  async function removeSelected(): Promise<void> {
    try {
      let keysToRemove = selected;
      await removeFiles(keysToRemove);
      clearSelectedFiles();
      enqueueSnackbar("Selected files have been removed", {
        variant: "success",
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function zipSelected(): Promise<void> {
    enqueueSnackbar("Your zipped files will start downloading shortly.", {
      variant: "success",
      autoHideDuration: 3000,
    });
    try {
      const response = await axios.get(
        `${BASE_API_URL}/api/v4/spaces/${code}/files/zip?keys=${JSON.stringify(
          selected
        )}`,
        {
          responseType: "blob",
        }
      );
      let folderName = response.headers["content-disposition"]
        .split("=")[1]
        .replace(/"/g, "");
      const { data } = response;
      await saveBlob(data, folderName);
      enqueueSnackbar("Successfully zipped files.", {
        variant: "success",
        autoHideDuration: 3000,
      });
      await axios.delete(
        `${BASE_API_URL}/api/v4/spaces/${code}/files/zip?folder=${folderName}`
      );
    } catch (err) {
      enqueueSnackbar(err.message, {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  }

  const dropZone = (
    <div {...getRootProps()} className={classes.uploadZone}>
      <div className={classes.centerWrapper}>
        <input {...getInputProps()} />
        <div className={classes.center}>
          {windowWidth > 960 ? (
            <>
              <p style={{ opacity: 0.7, margin: 5 }}>Drag and drop files</p>
              <p style={{ opacity: 0.7, margin: 5 }}>or</p>
            </>
          ) : (
            <p style={{ opacity: 0.7, margin: 5 }}>It's pretty empty here...</p>
          )}
          <div>
            <Button variant="success" startIcon={<CloudUploadIcon />}>
              Upload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const appBar = (
    <div className={classes.appBar}>
      <div className={classes.left}>
        <div className={classes.centerWrapper}>
          <div className={classes.center}>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {windowWidth > 600 ? (
                <Button
                  variant="success"
                  startIcon={<CloudUploadIcon style={{ marginLeft: "5px" }} />}
                >
                  Upload
                </Button>
              ) : (
                <GIconButton variant="success">
                  <CloudUploadIcon />
                </GIconButton>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className={classes.left}>
        <div className={classes.centerWrapper}>
          <div className={classes.center} style={{ textAlign: "left" }}>
            {selected.length === files?.length ? (
              <Button
                event={{ category: "File", action: "Deselected All Files" }}
                variant="primary"
                inverse
                debounce={0}
                startIcon={<ClearIcon />}
                onClick={clearSelectedFiles}
              >
                Deselect All
              </Button>
            ) : (
              <Button
                onClick={() => setSelected(files?.map((file) => file.key))}
                event={{ category: "File", action: "Selected All Files" }}
                variant="primary"
                inverse
                debounce={0}
                startIcon={<PlaylistAddCheckIcon />}
              >
                Select All
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className={classes.right}>
        <div className={classes.centerWrapper}>
          <div className={classes.center}>
            <Button
              variant="primary"
              event={{ category: "File", action: "Zip Selected Files" }}
              disabled={selected.length === 0}
              inverse
              onClick={zipSelected}
              startIcon={<FolderIcon />}
            >
              ZIP
            </Button>
          </div>
        </div>
      </div>
      <div className={classes.right}>
        <div className={classes.centerWrapper}>
          <div className={classes.center}>
            <Button
              variant="primary"
              event={{ category: "File", action: "Downloaded Selected Files" }}
              disabled={selected.length === 0}
              inverse
              startIcon={<CloudDownloadIcon />}
              onClick={downloadSelected}
            >
              Download
            </Button>
          </div>
        </div>
      </div>
      <div className={classes.right}>
        <div className={classes.centerWrapper}>
          <div className={classes.center}>
            <Button
              variant="primary"
              event={{ category: "File", action: "Removed Selected Files" }}
              disabled={selected.length === 0}
              inverse
              startIcon={<DeleteIcon />}
              onClick={removeSelected}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Grid
        container
        className={classes.container}
        justify="center"
        alignItems="center"
      >
        <MoonLoader color={Colors.MAIN_BRAND} size={32} />
      </Grid>
    );
  }
  return (
    <Grid container direction="column" className={classes.container}>
      {windowWidth > 960 && files && files.length > 0 && (
        <Grid item>{appBar}</Grid>
      )}

      <Grid item className={classes.content}>
        {windowWidth < 960 && files && files.length > 0 && (
          <div style={{ padding: "10px" }}>
            <FileUploadBtn handleFiles={onDrop} />
          </div>
        )}
        {files && files.length > 0 ? (
          <AnimatePresence>
            {files?.map((file, index) => (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ delay: index * 0.3 }}
                key={file.key}
              >
                <FileListItem file={file} />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          dropZone
        )}
      </Grid>
    </Grid>
  );
};

export default FilesPanel;
