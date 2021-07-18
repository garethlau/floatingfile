import React, { useEffect, useCallback, useReducer } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BASE_API_URL } from "../env";
import PlaylistAddCheckIcon from "@material-ui/icons/PlaylistAddCheck";
import ClearIcon from "@material-ui/icons/Clear";
import { AnimateSharedLayout, AnimatePresence, motion } from "framer-motion";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import Button from "./Button";
import { Colors } from "@floatingfile/common";
import { useDropzone } from "react-dropzone";
import useWindowWidth from "../hooks/useWindowWidth";
import { saveBlob } from "../utils";
import { useUploadService } from "../contexts/uploadService";
import { useSelectedFiles } from "../contexts/selectedFiles";
import { useSnackbar } from "notistack";
import useSpace from "../queries/useSpace";
import useRemoveFiles from "../mutations/useRemoveFiles";
import FileListItem from "./file-list-item";
import {
  Stack,
  Box,
  Flex,
  chakra,
  Spacer,
  HStack,
  CircularProgress,
} from "@chakra-ui/react";

enum actionTypes {
  UPDATE_DOWNLOAD_PROGRESS,
  START_DOWNLOAD,
  SET_DOWNLOAD_QUEUE,
  COMPLETE_ALL_DOWNLOADS,
}

interface State {
  total: number;
  progress: number;
  isDownloading: boolean;
  current: number;
}
function reducer(state: State, action: any) {
  switch (action.type) {
    case actionTypes.UPDATE_DOWNLOAD_PROGRESS:
      return { ...state, progress: action.payload };
    case actionTypes.START_DOWNLOAD:
      return { ...state, current: state.current + 1, progress: 0 };
    case actionTypes.SET_DOWNLOAD_QUEUE:
      return { ...state, total: action.payload, isDownloading: true };
    case actionTypes.COMPLETE_ALL_DOWNLOADS:
      return {
        ...state,
        total: 0,
        current: 0,
        progress: 0,
        isDownloading: false,
      };
    default:
      throw new Error(`Action of type ${action.type} not handled`);
  }
}
const initialState: State = {
  current: 0,
  total: 0,
  progress: 0,
  isDownloading: false,
};

const FilesPanel: React.FC = () => {
  const windowWidth = useWindowWidth();
  const { code }: { code: string } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { data: space, isLoading } = useSpace(code);
  const { mutateAsync: removeFiles } = useRemoveFiles(code);

  const files = space?.files || [];

  const {
    selected,
    isSelected,
    clear: clearSelectedFiles,
    setSelected,
  } = useSelectedFiles();

  const uploadService = useUploadService();

  useEffect(() => {
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

    const downloadQueue = files?.filter((file) => isSelected(file.key));

    // Set the total number of files in the download queue
    dispatch({
      type: actionTypes.SET_DOWNLOAD_QUEUE,
      payload: downloadQueue?.length || 0,
    });
    /* eslint-disable */
    while (!!downloadQueue && downloadQueue.length > 0) {
      const file = downloadQueue.shift();
      dispatch({ type: actionTypes.START_DOWNLOAD });
      if (!file || !file.signedUrl) return;
      const response = await axios.get(file.signedUrl, {
        responseType: "blob",
        onDownloadProgress: (event) => {
          dispatch({
            type: actionTypes.UPDATE_DOWNLOAD_PROGRESS,
            payload: event.loaded / event.total,
          });
        },
      });
      const { data } = response;
      await saveBlob(data, file.name);
      await axios.patch(`${BASE_API_URL}/api/v5/spaces/${code}/history`, {
        action: "DOWNLOAD_FILE",
        payload: file.key,
      });
    }
    /* eslint-enable */
    dispatch({ type: actionTypes.COMPLETE_ALL_DOWNLOADS });
  }

  async function removeSelected(): Promise<void> {
    try {
      const keysToRemove = selected;
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
        `${BASE_API_URL}/api/v5/spaces/${code}/files/zip?keys=${JSON.stringify(
          selected
        )}`,
        {
          responseType: "blob",
        }
      );
      const folderName = response.headers["content-disposition"]
        .split("=")[1]
        .replace(/"/g, "");
      const { data } = response;
      await saveBlob(data, folderName);
      enqueueSnackbar("Successfully zipped files.", {
        variant: "success",
        autoHideDuration: 3000,
      });
      await axios.delete(
        `${BASE_API_URL}/api/v5/spaces/${code}/files/zip?folder=${folderName}`
      );
    } catch (err) {
      enqueueSnackbar(err.message, {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  }

  const dropZone = (
    <chakra.div {...getRootProps()} w="100%" h="100%">
      <input {...getInputProps()} />
      <Flex align="center" justify="center" w="inherit" h="inherit">
        <Box textAlign="center">
          {windowWidth > 960 ? (
            <chakra.p opacity={0.7}>
              Drag and drop files
              <br />
              or
            </chakra.p>
          ) : (
            <chakra.p opacity={0.7}>It's pretty empty here...</chakra.p>
          )}
          <Button colorScheme="green" leftIcon={<CloudUploadIcon />}>
            Upload
          </Button>
        </Box>
      </Flex>
    </chakra.div>
  );

  const appBar = (
    <Flex align="center" p={2} bg="blue.500">
      <HStack>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <Button colorScheme="green" leftIcon={<CloudUploadIcon />}>
            Upload
          </Button>
        </div>
        {selected.length === files?.length ? (
          <Button
            colorSheme="white"
            leftIcon={<ClearIcon />}
            onClick={clearSelectedFiles}
          >
            Deselect All
          </Button>
        ) : (
          <Button
            colorScheme="white"
            onClick={() => {
              setSelected(files?.map((file) => file.key) || []);
            }}
            leftIcon={<PlaylistAddCheckIcon />}
          >
            Select All
          </Button>
        )}
      </HStack>
      <Spacer />
      <HStack>
        <Button
          disabled={selected.length === 0}
          colorScheme="white"
          onClick={removeSelected}
        >
          Remove
        </Button>
        <Button
          disabled={selected.length === 0}
          colorScheme="white"
          onClick={downloadSelected}
        >
          <chakra.span style={{ opacity: state.isDownloading ? 0 : 1 }}>
            Download
          </chakra.span>
          <chakra.span
            pos="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
          >
            {state.isDownloading &&
              `${(state.progress * 100).toFixed()}%` +
                ` (${state.current}/${state.total})`}
          </chakra.span>
        </Button>
        <Button
          colorScheme="white"
          disabled={selected.length === 0}
          onClick={zipSelected}
        >
          ZIP
        </Button>
      </HStack>
    </Flex>
  );

  if (isLoading) {
    return (
      <Flex w="100%" h="100%" align="center" justify="center">
        <CircularProgress isIndeterminate color="blue.300" />
      </Flex>
    );
  }
  return (
    <Flex direction="column" bg={Colors.LIGHT_SHADE} h="100%" w="100%">
      {windowWidth > 960 && appBar}
      <Box flexGrow={1} overflow="auto">
        {windowWidth < 960 && (
          // Upload button for mobile layout scrolls w/ file list
          <Box maxW="100vw" p={2}>
            <Button colorScheme="green" isFullWidth>
              Upload
            </Button>
          </Box>
        )}
        {files.length > 0 ? (
          <AnimatePresence>
            <AnimateSharedLayout>
              <Stack spacing={2} p={2} maxW="100vw">
                {files.map((file) => (
                  <motion.div
                    layout
                    key={file.key}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scaleY: 0.5, scaleX: 0.8 }}
                  >
                    <FileListItem file={file} />
                  </motion.div>
                ))}
              </Stack>
            </AnimateSharedLayout>
          </AnimatePresence>
        ) : (
          dropZone
        )}
      </Box>
    </Flex>
  );
};

export default FilesPanel;
