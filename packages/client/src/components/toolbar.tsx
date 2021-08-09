import React, { useCallback, useReducer } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PlaylistAddCheckIcon from "@material-ui/icons/PlaylistAddCheck";
import ClearIcon from "@material-ui/icons/Clear";
import { useDropzone } from "react-dropzone";
import { FaTrash, FaCloudDownloadAlt } from 'react-icons/fa'
import { GrDocumentZip } from 'react-icons/gr'
import { MdCloudUpload } from 'react-icons/md'
import {
    Flex,
    chakra,
    Spacer,
    HStack,
    CircularProgress,
    Tooltip,
    useBreakpointValue,
    IconButton,
    Icon,
    CircularProgressLabel,
    useToast,
} from "@chakra-ui/react";
import { saveBlob } from "../utils";
import { BASE_API_URL } from "../env";
import Button from "./Button";
import useSpace from "../queries/useSpace";
import useRemoveFiles from "../mutations/useRemoveFiles";
import { useUploadService } from "../contexts/uploadService";
import { useSelectedFiles } from "../contexts/selectedFiles";
import Honeybadger from "../lib/honeybadger";


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

const Toolbar: React.FC = () => {

    const [state, dispatch] = useReducer(reducer, initialState);
    const { code }: { code: string } = useParams();
    const { data: space } = useSpace(code);
    const { mutateAsync: removeFiles } = useRemoveFiles(code);
    const isCollapsed = useBreakpointValue({ base: true, lg: false })
    const toast = useToast();

    const files = space?.files || [];

    const {
        selected,
        isSelected,
        clear: clearSelectedFiles,
        setSelected,
    } = useSelectedFiles();
    const uploadService = useUploadService();
    const onDrop = useCallback(async (droppedFiles: File[]) => {
        uploadService.enqueueMany(droppedFiles);
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
    });

    async function downloadSelected() {
        toast({
            title: "Downloading selected files.",
            description: "Please ensure floatingfile has access to download multiple files.",
            isClosable: true,
            status: "info"
        })

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
            toast({
                title: "Files have been removed",
                isClosable: true,
                status: "success"
            })
        } catch (error) {
            Honeybadger.notify(error);
        }
    }

    async function zipSelected(): Promise<void> {
        toast({
            title: "Zipping files",
            description: "Your selected files are being zipped and will start downloading shortly.",
            status: "info"
        })
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
            toast.closeAll();
            toast({
                title: "Successfully zipped files",
                status: "success"
            })
            await axios.delete(
                `${BASE_API_URL}/api/v5/spaces/${code}/files/zip?folder=${folderName}`
            );
        } catch (err) {
            toast({
                title: "Error zipping selected files",
                description: err.message,
                status: "error"
            })
        }
    }

    return (
        <Flex align="center" p={2} bg="blue.500">
            <HStack>
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    {!isCollapsed ? (

                        <Button colorScheme="green" leftIcon={<Icon as={MdCloudUpload} />}>
                            Upload
                        </Button>
                    ) : (
                        <Tooltip label="Upload files">
                            <IconButton aria-label="Upload files" icon={<Icon as={MdCloudUpload} />}
                                colorScheme="green"
                            />
                        </Tooltip>
                    )}
                </div>
                {selected.length === files?.length ? (
                    <>
                        {!isCollapsed ? (
                            <Button
                                colorSheme="white"
                                leftIcon={<ClearIcon />}
                                onClick={clearSelectedFiles}
                            >
                                Deselect All
                            </Button>
                        ) : (
                            <Tooltip label="Deselect all files">
                                <IconButton onClick={clearSelectedFiles} aria-label="Deselect All" icon={<ClearIcon />} />
                            </Tooltip>
                        )}
                    </>
                ) : (
                    <>
                        {!isCollapsed ? (

                            <Button
                                colorScheme="white"
                                onClick={() => {
                                    setSelected(files?.map((file) => file.key) || []);
                                }}
                                leftIcon={<PlaylistAddCheckIcon />}
                            >
                                Select All
                            </Button>
                        ) : (
                            <Tooltip label="Select all files">
                                <IconButton
                                    onClick={() => {
                                        setSelected(files?.map((file) => file.key) || []);
                                    }}
                                    aria-label="Select All" icon={<PlaylistAddCheckIcon />} />
                            </Tooltip>
                        )}
                    </>
                )}
            </HStack>
            <Spacer />
            <HStack>
                {!isCollapsed ? (
                    <Button
                        disabled={selected.length === 0}
                        colorScheme="white"
                        onClick={removeSelected}
                    >
                        Remove
                    </Button>
                ) : (
                    <Tooltip label='Remove selected files' >
                        <IconButton
                            disabled={selected.length === 0}
                            aria-label="Remove Selected Files" icon={<Icon as={FaTrash} />} />
                    </Tooltip>
                )}
                {!isCollapsed ? (
                    <Button
                        colorScheme="white"
                        disabled={selected.length === 0}
                        onClick={zipSelected}
                    >
                        ZIP
                    </Button>
                ) : (
                    <Tooltip label="ZIP selected files">
                        <IconButton
                            disabled={selected.length === 0}
                            aria-label="ZIP selected files"
                            icon={<Icon as={GrDocumentZip} />}
                            onClick={zipSelected}
                        />
                    </Tooltip>
                )}
                {!isCollapsed ? (

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
                ) : (

                    <IconButton
                        disabled={selected.length === 0}
                        onClick={downloadSelected} aria-label="Download selected files"
                        isLoading={state.isDownloading}
                        icon={<Icon as={FaCloudDownloadAlt} />}
                        spinner={
                            <CircularProgress size="36px" value={state.progress * 100} color="green" capIsRound>
                                <CircularProgressLabel>
                                    {state.current}/{state.total}
                                </CircularProgressLabel>
                            </CircularProgress>

                        }
                    />
                )}
            </HStack>
        </Flex>
    );
}

export default Toolbar;