import React, { useState, useRef, useEffect } from "react";
import { Colors } from "@floatingfile/ui";
import { isMobile } from "react-device-detect";
import { useParams } from "react-router-dom";
import {
  Flex,
  Spacer,
  Button,
  chakra,
  Box,
  IconButton,
  Icon,
  Tooltip,
  CircularProgress,
  Progress,
} from "@chakra-ui/react";
import { FaTrash, FaCloudDownloadAlt } from "react-icons/fa";
import { MdOpenInBrowser, MdStop } from "react-icons/md";
import axios, { CancelTokenSource } from "axios";
import { useSelectedFiles } from "../contexts/selectedFiles";
import useSpace from "../hooks/useSpace";
import FileIcon from "./FileIcon";
import Honeybadger from "../lib/honeybadger";
import useLayout, { Layouts } from "../hooks/useLayout";
import { formatBytes } from "../utils";

const FileListItem: React.FC<{
  file: {
    id: string;
    name: string;
    key: string;
    ext: string;
    size: string;
    previewUrl?: string;
  };
}> = ({ file }) => {
  const { id, previewUrl, name, ext } = file;
  const size = parseInt(file.size, 10);
  const signedUrl = ""; // FIXME:
  const { code }: { code: string } = useParams();
  const { removeFile, downloadFile } = useSpace(code);
  const { toggleSelect, isSelected } = useSelectedFiles();
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const layout = useLayout();
  const ref = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const sourceRef = useRef<CancelTokenSource | null>(null);

  useEffect(() => {
    function calcWidth() {
      const clientRect = ref.current?.getBoundingClientRect();
      const width = clientRect?.width || 0;
      setContainerWidth(width);
    }
    // Calculate initial width of parent container
    calcWidth();
    window.addEventListener("resize", calcWidth);
    return () => window.removeEventListener("resize", calcWidth);
  }, []);

  function cancel(e: React.SyntheticEvent) {
    e.stopPropagation();
    if (sourceRef.current) {
      sourceRef.current.cancel("Operation cancelled");
    }
  }
  async function download(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    e.stopPropagation();
    if (isMobile) {
      // FIXME: File download should work on mobile as well!
      window.open(signedUrl, "_blank");
    } else {
      try {
        setIsDownloading(true);

        if (!sourceRef.current) {
          sourceRef.current = axios.CancelToken.source();
        }

        await downloadFile(id, name, {
          cancelToken: sourceRef.current?.token,
          onDownloadProgress: (event) => {
            setDownloadProgress(event.loaded / event.total);
          },
        });
      } catch (error) {
        if (axios.isCancel(error)) {
          sourceRef.current = null;
        } else {
          Honeybadger.notify(error);
        }
      } finally {
        setIsDownloading(false);
        setDownloadProgress(0);
      }
    }
  }

  async function remove(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    e.stopPropagation();
    try {
      await removeFile(id);
    } catch (error) {
      Honeybadger.notify(error);
    }
  }

  return (
    <Flex
      ref={ref}
      p={2}
      w="100%"
      shadow="md"
      borderRadius="md"
      align="center"
      bg={
        layout === Layouts.MOBILE
          ? Colors.LIGHT_SHADE
          : isSelected(id)
          ? "#DDE8F8"
          : "white"
      }
      onClick={() => toggleSelect(id)}
      _hover={{ cursor: "pointer" }}
      transition="background-color ease 0.3s"
    >
      <Box w="50px" h="50px">
        <FileIcon extension={ext} previewUrl={previewUrl} />
      </Box>
      <Box w="50%">
        <chakra.p textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
          {name}
        </chakra.p>
        <chakra.p opacity={0.7}>{formatBytes(size)}</chakra.p>
      </Box>
      <Spacer />
      <Box>
        {containerWidth > 540 ? (
          <>
            <Button colorScheme="blue" onClick={remove} mr="5px">
              Remove
            </Button>
            <Button
              colorScheme="blue"
              onClick={!isDownloading ? download : cancel}
            >
              <chakra.span opacity={isDownloading ? 0 : 1}>
                Download
              </chakra.span>
              <chakra.span
                pos="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
              >
                {isDownloading && "Cancel"}
              </chakra.span>
              <chakra.div
                pos="absolute"
                bottom="0"
                left="50%"
                transform="translate(-50%, 0)"
                w="100%"
              >
                {isDownloading && (
                  <Progress
                    size="xs"
                    colorScheme="green"
                    bg="blue.500"
                    value={downloadProgress * 100}
                    borderRadius="md"
                  />
                )}
              </chakra.div>
            </Button>
          </>
        ) : (
          <>
            <Tooltip label="Remove file">
              <IconButton
                colorScheme="blue"
                onClick={remove}
                aria-label="Remove File"
                icon={<Icon as={FaTrash} />}
                mr="5px"
              />
            </Tooltip>
            <Tooltip
              label={!isDownloading ? "Download file" : "Cancel download"}
            >
              <Button
                w="40px"
                h="40px"
                colorScheme="blue"
                onClick={!isDownloading ? download : cancel}
                aria-label="Download file"
              >
                <Icon
                  opacity={isDownloading ? 0 : 1}
                  as={isMobile ? MdOpenInBrowser : FaCloudDownloadAlt}
                />
                <chakra.span
                  pos="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                >
                  {isDownloading && <Icon as={MdStop} />}
                </chakra.span>
                <chakra.div
                  pos="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                >
                  {isDownloading && (
                    <CircularProgress
                      size="36px"
                      value={downloadProgress * 100}
                      color="green"
                      capIsRound
                    />
                  )}
                </chakra.div>
              </Button>
            </Tooltip>
          </>
        )}
      </Box>
    </Flex>
  );
};

export default FileListItem;
