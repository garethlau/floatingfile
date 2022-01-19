import React, { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { chakra, useDisclosure } from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import ConfirmBulkUpload from "./modals/ConfirmBulkUpload";
import { useUploadService } from "../contexts/uploadService";

export type FileDropProps = {
  isFullWidth?: boolean;
  isFullHeight?: boolean;
};

const FileDrop: React.FC<FileDropProps> = ({
  isFullWidth = false,
  isFullHeight = false,
  children,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { code }: { code: string } = useParams();
  const uploadService = useUploadService(code);

  const onDrop = useCallback(async (droppedFiles: File[]) => {
    if (droppedFiles.length > 5) {
      // the user has chosen a "lot" of files
      // cache the files
      setFiles(droppedFiles);
      // prompt the user for confirmation
      onOpen();
    } else {
      uploadService.enqueueMany(droppedFiles);
    }
  }, []);

  const uploadMany = () => {
    // upload the files
    uploadService.enqueueMany(files);
    // clear the cache
    setFiles([]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
  });

  return (
    <>
      <ConfirmBulkUpload
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={uploadMany}
        onCancel={() => setFiles([])}
        numFiles={files.length}
      />
      <chakra.div
        {...getRootProps()}
        w={isFullWidth ? "100%" : "auto"}
        h={isFullHeight ? "100%" : "auto"}
      >
        <input {...getInputProps()} />
        {children}
      </chakra.div>
    </>
  );
};

export default FileDrop;
