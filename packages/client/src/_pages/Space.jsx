import React, {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useContext,
} from "react";
import { useHistory, useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { isMobile } from "react-device-detect";
import MoonLoader from "react-spinners/MoonLoader";
import { useSnackbar } from "notistack";
import { AnimatePresence, motion } from "framer-motion";
import { makeStyles } from "@material-ui/core/styles";
import PublicIcon from "@material-ui/icons/Public";
import HistoryIcon from "@material-ui/icons/History";
import PeopleIcon from "@material-ui/icons/People";
import FolderIcon from "@material-ui/icons/Folder";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import SettingsIcon from "@material-ui/icons/Settings";
import PlaylistAddCheckIcon from "@material-ui/icons/PlaylistAddCheck";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import DeleteIcon from "@material-ui/icons/Delete";
import ClearIcon from "@material-ui/icons/Clear";
import {
  BASE_API_URL,
  USERNAME_STORAGE_KEY,
  LAST_VISIT_STORAGE_KEY,
} from "../env";
import { Colors, Breakpoints } from "../constants";
import { SelectedFilesContext } from "../_contexts/selectedFiles";
import { UploadServiceContext } from "../_contexts/uploadService";
import FileUploadBtn from "../_components/FileUploadBtn";
import Center from "../_components/Center";
import Button from "../_components/Button";
import NavTile from "../_components/NavTile";
import GIconButton from "../_components/GIconButton";
import IntroToast from "../_components/IntroToast";
import UploadQueue from "../_components/UploadQueue";
import useSpace from "../_queries/useSpace";
import useFiles from "../_queries/useFiles";
import useUsers from "../_queries/useUsers";
import { default as useSpaceHistory } from "../_queries/useHistory";
import useRemoveFiles from "../_mutations/useRemoveFiles";
import useWindowWidth from "../_hooks/useWindowWidth";
import useDocumentTitle from "../_hooks/useDocumentTitle";
import { saveBlob } from "../_utils";

const SettingsPanel = React.lazy(() => import("../_components/SettingsPanel"));
const ConnectPanel = React.lazy(() => import("../_components/ConnectPanel"));
const HistoryPanel = React.lazy(() => import("../_components/HistoryPanel"));
const UsersPanel = React.lazy(() => import("../_components/UsersPanel"));
const FileListItem = React.lazy(() => import("../_components/FileListItem"));

const EventTypes = {
  CONNECTION_ESTABLISHED: "CONNECTION_ESTABLISHED",
  FILES_UPDATED: "FILES_UPDATED",
  HISTORY_UPDATED: "HISTORY_UPDATED",
  USERS_UPDATED: "USERS_UPDATED",
  SPACE_DELETED: "SPACE_DELETED",
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100vw",
    height: "100vh",
    display: "grid",
    [theme.breakpoints.up("xs")]: {
      // gridTemplateAreas: "'main' 'nav'",
      // gridTemplateRows: "calc(100vh - 64px) 64px",
      gridTemplateAreas: "'nav' 'main'",
      gridTemplateRows: "64px auto",
      gridTemplateColumns: "1fr",
    },
    [theme.breakpoints.up("sm")]: {
      gridTemplateAreas: "'main' 'nav'",
      gridTemplateRows: "calc(100vh - 64px) 64px",
    },
    [theme.breakpoints.up("md")]: {
      gridTemplateAreas: "'nav panel main'",
      gridTemplateRows: "100vh",
      gridTemplateColumns: "80px 240px auto",
    },
    [theme.breakpoints.up("lg")]: {},
    [theme.breakpoints.up("xl")]: {},
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
  nav: {
    gridArea: "nav",
    backgroundColor: Colors.MAIN_BRAND,
    display: "grid",
    gridTemplateColumns: "repeat(5, 64px)",
    gridTemplateRows: "1fr",
    [theme.breakpoints.up("md")]: {
      gridTemplateColumns: "1fr",
      gridTemplateRows: "repeat(4, 80px)",
    },
  },
  filesTab: {
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  panel: {
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
    gridArea: "panel",
    backgroundColor: Colors.WHITE,
  },
  main: {
    gridArea: "main",
    backgroundColor: Colors.LIGHT_SHADE,
    display: "grid",
    gridTemplateRows: "auto",
    [theme.breakpoints.up("sm")]: {
      gridTemplateRows: "calc(100vh - 64px)",
    },
    [theme.breakpoints.up("md")]: {
      gridTemplateRows: "64px calc(100vh - 64px)",
    },
    [theme.breakpoints.up("lg")]: {},
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
}));

const panelFallback = null;

export default function Space() {
  const cls = useStyles();
  const windowWidth = useWindowWidth();
  const history = useHistory();
  const { code } = useParams();
  const {
    selected,
    isSelected,
    clear: clearSelectedFiles,
    setSelected,
  } = useContext(SelectedFilesContext);

  useDocumentTitle(`floatingfile | ${code}`);

  const { status: spaceStatus, refetch: refetchSpace } = useSpace(code);

  const [activePanel, setActivePanel] = useState(1);
  const [collapsed, setCollapsed] = useState(null);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const { data: files, refetch: refetchFiles } = useFiles(code);
  const { refetch: refetchHistory } = useSpaceHistory(code);
  const { refetch: refetchUsers } = useUsers(code);

  const { mutateAsync: removeFiles } = useRemoveFiles(code);
  const uploadService = useContext(UploadServiceContext);

  const [myClientId, setMyClientId] = useState("");

  async function downloadSelected() {
    enqueueSnackbar(
      "Your files will start downloading shortly. Please ensure floatingfile has access to download multiple files.",
      {
        variant: "success",
        autoHideDuration: 3000,
      }
    );

    let downloadQueue = files.filter((file) => isSelected(file.key));
    while (downloadQueue.length > 0) {
      const file = downloadQueue.shift();
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

  async function removeSelected() {
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

  async function zipSelected() {
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

  useEffect(() => {
    if (spaceStatus === "success") {
    } else if (spaceStatus === "error") {
      enqueueSnackbar(
        "There was an error loading the space. Please reload the page.",
        {
          variant: "error",
          action: (
            <Button
              variant="danger"
              inverse
              onClick={() => window.location.reload()}
            >
              Reload
            </Button>
          ),
        }
      );
    }
  }, [spaceStatus]);

  useEffect(() => {
    // Show intro modal
    let weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    let lastVisit = localStorage.getItem(LAST_VISIT_STORAGE_KEY);
    if (!lastVisit || new Date(lastVisit) < new Date(weekAgo)) {
      const key = enqueueSnackbar(
        <IntroToast handleClose={() => closeSnackbar(key)} />,
        {
          persist: true,
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        }
      );
    }

    // Set last visit date
    localStorage.setItem(LAST_VISIT_STORAGE_KEY, new Date());
  }, []);

  useEffect(() => {
    const username = localStorage.getItem(USERNAME_STORAGE_KEY);
    let eventSource = new EventSource(
      `${BASE_API_URL}/api/v4/subscriptions/${code}?username=${username}`
    );

    eventSource.onerror = (error) => {
      console.log(error);
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      const { type, clientId } = data;
      switch (type) {
        case EventTypes.CONNECTION_ESTABLISHED:
          setMyClientId(clientId);
          refetchSpace();
          refetchFiles();
          refetchHistory();
          refetchUsers();
          break;
        case EventTypes.FILES_UPDATED:
          refetchFiles();
          refetchHistory();
          break;
        case EventTypes.HISTORY_UPDATED:
          refetchHistory();
          break;
        case EventTypes.USERS_UPDATED:
          refetchHistory();
          refetchUsers();
          break;
        case EventTypes.SPACE_DELETED:
          enqueueSnackbar(
            "This space has been destroyed. Redirecting you to the home page.",
            { variant: "error" }
          );

          setTimeout(() => {
            closeSnackbar();
            history.push("/");
          }, 3000);
          break;
        default:
          console.log(event + " is not handled");
      }
    };
    return () => {
      eventSource.close();
    };
  }, [code]);

  useEffect(() => {
    if (collapsed === null) {
      // First time
      if (windowWidth < 960) {
        setCollapsed(true);
        setActivePanel(0);
      } else {
        setCollapsed(false);
        setActivePanel(1);
      }
    } else {
      if (windowWidth < 960 && !collapsed) {
        // Collapsing from desktop to mobile
        setCollapsed(true);
        setActivePanel(0);
      }
      if (windowWidth > 960 && collapsed) {
        // Expanding from mobile to desktop
        setCollapsed(false);
        setActivePanel(1);
      }
      if (windowWidth > 960) {
        setCollapsed(false);
      }
    }
  }, [windowWidth, collapsed]);

  const changeActivePanel = (index) => () => {
    setActivePanel(index);
  };

  const onDrop = useCallback(async (droppedFiles) => {
    uploadService.setCode(code);
    uploadService.enqueueMany(droppedFiles);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
  });

  const appBar = (
    <div className={cls.appBar}>
      <div className={cls.left}>
        <div className={cls.centerWrapper}>
          <div className={cls.center}>
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
      <div className={cls.left}>
        <div className={cls.centerWrapper}>
          <div className={cls.center} style={{ textAlign: "left" }}>
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
      <div className={cls.right}>
        <div className={cls.centerWrapper}>
          <div className={cls.center}>
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
      <div className={cls.right}>
        <div className={cls.centerWrapper}>
          <div className={cls.center}>
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
      <div className={cls.right}>
        <div className={cls.centerWrapper}>
          <div className={cls.center}>
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

  const dropZone = (
    <div {...getRootProps()} className={cls.uploadZone}>
      <div className={cls.centerWrapper}>
        <input {...getInputProps()} />
        <div className={cls.center}>
          {!collapsed ? (
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

  return (
    <React.Fragment>
      <UploadQueue />
      <div className={cls.root}>
        <div className={cls.nav}>
          <div className={cls.filesTab}>
            <NavTile
              onClick={changeActivePanel(0)}
              active={activePanel === 0}
              collapsed={collapsed}
            >
              <FolderIcon />
            </NavTile>
          </div>
          <div>
            <NavTile
              onClick={changeActivePanel(1)}
              active={activePanel === 1}
              collapsed={collapsed}
            >
              <PublicIcon />
            </NavTile>
          </div>
          <div>
            <NavTile
              onClick={changeActivePanel(2)}
              active={activePanel === 2}
              collapsed={collapsed}
            >
              <HistoryIcon />
            </NavTile>
          </div>
          <div>
            <NavTile
              onClick={changeActivePanel(3)}
              active={activePanel === 3}
              collapsed={collapsed}
            >
              <PeopleIcon />
            </NavTile>
          </div>
          {/* <div>
						<NavTile onClick={changeActivePanel(4)} active={activePanel === 4} collapsed={collapsed}>
							<SettingsIcon />
						</NavTile>
					</div> */}
        </div>
        <div className={cls.panel}>
          <div
            style={{
              display: activePanel === 1 ? "inherit" : "none",
              height: "100%",
            }}
          >
            <Suspense fallback={panelFallback}>
              <ConnectPanel />
            </Suspense>
          </div>
          <div style={{ display: activePanel === 2 ? "inherit" : "none" }}>
            <Suspense fallback={panelFallback}>
              <HistoryPanel />
            </Suspense>
          </div>
          <div style={{ display: activePanel === 3 ? "inherit" : "none" }}>
            <Suspense fallback={panelFallback}>
              <UsersPanel myClientId={myClientId} />
            </Suspense>
          </div>
          <div style={{ display: activePanel === 4 ? "inherit" : "none" }}>
            <Suspense fallback={panelFallback}>
              <SettingsPanel />
            </Suspense>
          </div>
        </div>
        <div className={cls.main}>
          {spaceStatus === "loading" ? (
            <>
              {!collapsed && <div></div>}
              <Center>
                <MoonLoader
                  css="margin: auto;"
                  color={Colors.MAIN_BRAND}
                  size={32}
                />
              </Center>
            </>
          ) : (
            <>
              {windowWidth > Breakpoints.MD && (
                <>{files?.length > 0 ? appBar : <div></div>}</>
              )}
              <div style={{ overflowY: "auto", height: "100%" }}>
                {!collapsed || (collapsed && activePanel === 0) ? (
                  <>
                    {files?.length > 0 ? (
                      <>
                        {windowWidth > Breakpoints.SM &&
                          windowWidth < Breakpoints.MD &&
                          appBar}
                        {windowWidth < Breakpoints.SM && (
                          <div>
                            <Center>
                              <div style={{ padding: "10px" }}>
                                <FileUploadBtn handleFiles={onDrop} />
                              </div>
                            </Center>
                          </div>
                        )}
                        <div style={{ overflowX: "hidden" }}>
                          <Suspense fallback={null}>
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
                          </Suspense>
                        </div>
                      </>
                    ) : (
                      dropZone
                    )}
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        display: activePanel === 1 ? "inherit" : "none",
                        height: "100%",
                      }}
                    >
                      <Suspense fallback={panelFallback}>
                        <ConnectPanel />
                      </Suspense>
                    </div>
                    <div
                      style={{
                        display: activePanel === 2 ? "inherit" : "none",
                      }}
                    >
                      <Suspense fallback={panelFallback}>
                        <HistoryPanel collapsed />
                      </Suspense>
                    </div>
                    <div
                      style={{
                        display: activePanel === 3 ? "inherit" : "none",
                      }}
                    >
                      <Suspense fallback={panelFallback}>
                        <UsersPanel collapsed myClientId={myClientId} />
                      </Suspense>
                    </div>
                    <div
                      style={{
                        display: activePanel === 4 ? "inherit" : "none",
                      }}
                    >
                      <Suspense fallback={panelFallback}>
                        <SettingsPanel collapsed />
                      </Suspense>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}
