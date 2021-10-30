import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { File, Colors } from "@floatingfile/common";
import { isMobile } from "react-device-detect";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useIsMutating } from "react-query";
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
  CircularProgressLabel,
} from "@chakra-ui/react";
import { FaTrash, FaCloudDownloadAlt } from "react-icons/fa";
import { MdOpenInBrowser } from "react-icons/md";
import useRemoveFile from "../mutations/useRemoveFile";
import { useSelectedFiles } from "../contexts/selectedFiles";
import { saveBlob } from "../utils";
import FileIcon from "./FileIcon";
import Honeybadger from "../lib/honeybadger";
import useLayout, { Layouts } from "../hooks/useLayout";

const FileListItem: React.FC<{ file: File }> = ({ file }) => {
  const { name, key, ext, size, signedUrl } = file;
  const { code }: { code: string } = useParams();
  const { mutateAsync: removeFile } = useRemoveFile(code);
  const { toggleSelect, isSelected } = useSelectedFiles();
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const isMutating = useIsMutating({ mutationKey: ["space", code] });
  const layout = useLayout();
  const ref = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

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

  async function download(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    e.stopPropagation();
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
        await axios.patch(`/api/v5/spaces/${code}/history`, {
          action: "DOWNLOAD_FILE",
          payload: key,
        });
      } catch (error) {
        Honeybadger.notify(error);
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
      await removeFile(key);
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
          : isSelected(key)
          ? "#DDE8F8"
          : "white"
      }
      onClick={() => toggleSelect(key)}
      _hover={{ cursor: "pointer" }}
      transition="background-color ease 0.3s"
    >
      <Box w="50px" h="50px">
        <FileIcon extension={ext} previewUrl={file.previewUrl} />
      </Box>
      <Box w="50%">
        <chakra.p textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
          {name}
        </chakra.p>
        <chakra.p opacity={0.7}>
          {!Number.isNaN(size / 1000)
            ? size > 1000000
              ? `${(size / (1024 * 1024)).toFixed(1)} MB`
              : `${(size / 1024).toFixed(1)} KB`
            : ""}
        </chakra.p>
      </Box>
      <Spacer />
      <Box>
        {containerWidth > 540 ? (
          <>
            <Button
              colorScheme="blue"
              isDisabled={isMutating > 0}
              onClick={remove}
              mr="5px"
            >
              Remove
            </Button>
            <Button colorScheme="blue" onClick={download}>
              <chakra.span opacity={isDownloading ? 0 : 1}>
                Download
              </chakra.span>
              <chakra.span
                pos="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
              >
                {isDownloading && `${(downloadProgress * 100).toFixed(1)}%`}
              </chakra.span>
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
            <Tooltip label="Download file">
              <IconButton
                colorScheme="blue"
                onClick={download}
                aria-label="Download file"
                isLoading={isDownloading}
                icon={
                  <Icon as={isMobile ? MdOpenInBrowser : FaCloudDownloadAlt} />
                }
                spinner={
                  <CircularProgress
                    size="36px"
                    value={downloadProgress * 100}
                    color="green"
                    capIsRound
                  />
                }
              />
            </Tooltip>
          </>
        )}
      </Box>
    </Flex>
  );
};

export default FileListItem;
