import React, { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { AnimateSharedLayout, AnimatePresence, motion } from "framer-motion";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import Button from "./Button";
import { Colors } from "@floatingfile/ui";
import { useDropzone } from "react-dropzone";
import useWindowWidth from "../hooks/useWindowWidth";
import { useUploadService } from "../contexts/uploadService";
import useSpace from "../hooks/useSpace";
import FileListItem from "./FileListItem";
import { Stack, Box, Flex, chakra, CircularProgress } from "@chakra-ui/react";
import useLayout, { Layouts } from "../hooks/useLayout";
import Toolbar from "./Toolbar";

const FilesPanel: React.FC = () => {
  const windowWidth = useWindowWidth();
  const { code }: { code: string } = useParams();
  const { space, isLoading } = useSpace(code);
  const layout = useLayout();

  const files = space?.files || [];

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

  const dropZone = (
    <chakra.div {...getRootProps()} flexGrow={1} display="flex" w="100%">
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
            <chakra.p opacity={0.7}>It&apos;s pretty empty here...</chakra.p>
          )}
          <Button colorScheme="green" leftIcon={<CloudUploadIcon />}>
            Upload
          </Button>
        </Box>
      </Flex>
    </chakra.div>
  );

  if (isLoading) {
    return (
      <Flex w="100%" h="100%" align="center" justify="center">
        <CircularProgress isIndeterminate color="blue.300" />
      </Flex>
    );
  }
  return (
    <Flex
      direction="column"
      bg={layout === Layouts.MOBILE ? "white" : Colors.LIGHT_SHADE}
      // bg={windowWidth > 960 ? Colors.LIGHT_SHADE : "white"}
      h="100%"
      w="100%"
    >
      {(layout === Layouts.TABLET || layout === Layouts.DESKTOP) &&
        files.length > 0 && <Toolbar />}
      {/* {windowWidth > 960 && files.length > 0 && appBar} */}
      <Box flexGrow={1} overflow="auto" display="flex" flexDirection="column">
        {layout === Layouts.MOBILE && files.length > 0 && (
          // Upload button for mobile layout scrolls w/ file list
          <Box maxW="100vw" p={2}>
            <Button colorScheme="green" isFullWidth>
              Upload
            </Button>
          </Box>
        )}
        {/* {windowWidth < 960 && files.length > 0 && (
        )} */}
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
