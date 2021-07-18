import React, { useState, useEffect } from "react";
import { Colors } from "@floatingfile/common";
import { FaRegWindowMinimize } from "react-icons/fa";
import { isMobile } from "react-device-detect";
import { motion, AnimateSharedLayout } from "framer-motion";
import {
  Icon,
  chakra,
  Box,
  Flex,
  Progress,
  Spacer,
  Stack,
  IconButton,
  Slide,
} from "@chakra-ui/react";
import { WrappedFile, useUploadService } from "../contexts/uploadService";
import { formatFileSize } from "../utils";
import Button from "./Button";

interface FileCardProps {
  name: string;
  onCancel?: any;
  size: number;
  isActive: boolean;
  progress?: number;
}

const FileCard: React.FC<FileCardProps> = ({
  name,
  onCancel,
  size,
  isActive,
  progress = 0,
}) => (
  <Box borderRadius="sm" shadow="base" bg={Colors.LIGHT_SHADE} p={2}>
    <Flex align="center">
      <Box>
        <chakra.p
          textOverflow="ellipsis"
          maxWidth={isActive ? "180px" : "270px"}
          overflow="hidden"
          whiteSpace="nowrap"
        >
          {name}
        </chakra.p>
        <chakra.p opacity={0.7}>{formatFileSize(size)}</chakra.p>
      </Box>
      <Spacer />
      {isActive && (
        <Button size="sm" colorScheme="red" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </Flex>
    <Progress size="sm" value={progress} colorScheme="green" />
  </Box>
);

const UploadQueue: React.FC = () => {
  const uploadService = useUploadService();
  const [open, setOpen] = useState<boolean>(false);
  const [minimized, setMinimized] = useState<boolean>(false);

  useEffect(() => {
    if (uploadService.size() > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [uploadService]);

  function toggleMinimized() {
    setMinimized(!minimized);
  }

  return (
    <Slide
      direction="bottom"
      in={open && !isMobile}
      style={{
        zIndex: 2,
        left: "auto",
        right: "30px",
        width: "300px",
        bottom: 0,
      }}
    >
      <Box
        id="panel"
        shadow="md"
        w="300px"
        h={!minimized ? "400px" : "50px"}
        marginLeft="auto"
        marginRight="30px"
        transition="height ease 0.2s"
      >
        <Flex align="center" bg="blue.500" p={4} borderTopRadius="md" h="50px">
          <chakra.p fontSize="1.5rem" fontWeight="bold" color="white">
            Upload Queue
          </chakra.p>
          <Spacer />
          <IconButton
            size="sm"
            variant="unstyled"
            aria-label={open ? "Close Upload Queue" : "Open Upload Queue"}
            onClick={toggleMinimized}
            icon={<Icon color="white" as={FaRegWindowMinimize} />}
          />
        </Flex>
        <chakra.div bg="white" w="100%" h="350px" overflowY="auto">
          <AnimateSharedLayout>
            <Stack spacing={2} p={2}>
              {uploadService.pending?.map(({ file, id }: WrappedFile) => (
                <motion.div layout key={id}>
                  <FileCard
                    name={file.name}
                    isActive={uploadService.currentUpload === id}
                    onCancel={() => uploadService.cancel(id)}
                    progress={(uploadService.getProgress(id) || 0) * 100}
                    size={file.size}
                  />
                </motion.div>
              ))}
            </Stack>
          </AnimateSharedLayout>
        </chakra.div>
      </Box>
    </Slide>
  );
};

export default UploadQueue;
