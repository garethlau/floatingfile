import React from "react";
import { useParams } from "react-router-dom";
import { AnimateSharedLayout, AnimatePresence, motion } from "framer-motion";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import Button from "./Button";
import { Colors } from "@floatingfile/ui";
import useWindowWidth from "../hooks/useWindowWidth";
import useSpace from "../hooks/useSpace";
import FileListItem from "./FileListItem";
import { Stack, Box, Flex, chakra, CircularProgress } from "@chakra-ui/react";
import useLayout, { Layouts } from "../hooks/useLayout";
import Toolbar from "./Toolbar";
import FileDrop from "./FileDrop";

const FilesPanel: React.FC = () => {
  const windowWidth = useWindowWidth();
  const { code }: { code: string } = useParams();
  const { space, isLoading } = useSpace(code);
  const layout = useLayout();

  const files = space?.files || [];

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
            <FileDrop>
              <Button colorScheme="green" isFullWidth>
                Upload
              </Button>
            </FileDrop>
          </Box>
        )}
        {/* {windowWidth < 960 && files.length > 0 && (
        )} */}
        {files.length > 0 ? (
          <AnimatePresence>
            <AnimateSharedLayout>
              <Stack spacing={2} p={2} maxW="100vw" h="100%">
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
                <FileDrop isFullHeight />
              </Stack>
            </AnimateSharedLayout>
          </AnimatePresence>
        ) : (
          <FileDrop isFullHeight>
            <Flex align="center" justify="center" w="inherit" h="inherit">
              <Box textAlign="center">
                {windowWidth > 960 ? (
                  <chakra.p opacity={0.7}>
                    Drag and drop files
                    <br />
                    or
                  </chakra.p>
                ) : (
                  <chakra.p opacity={0.7}>
                    It&apos;s pretty empty here...
                  </chakra.p>
                )}
                <Button colorScheme="green" leftIcon={<CloudUploadIcon />}>
                  Upload
                </Button>
              </Box>
            </Flex>
          </FileDrop>
        )}
      </Box>
    </Flex>
  );
};

export default FilesPanel;
