import React, { useState, useEffect } from "react";
import { WrappedFile, useUploadService } from "../contexts/uploadService";
import { makeStyles } from "@material-ui/core/styles";
import { formatFileSize } from "../utils";
import { Colors } from "@floatingfile/common";
import MinimizeIcon from "@material-ui/icons/Minimize";
import IconButton from "@material-ui/core/IconButton";
import LinearProgress from "@material-ui/core/LinearProgress";
import { isMobile } from "react-device-detect";
import { motion, AnimatePresence, AnimateSharedLayout } from "framer-motion";
import Button from "./Button";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "300px",
    height: "400px",
    backgroundColor: "white",
    bottom: "0",
    right: "30px",
    position: "fixed",
    boxShadow: theme.shadows[10],
    borderRadius: "5px",
    zIndex: 15,
    transition: "height ease 0.2s",
  },
  minimized: {
    height: "50px",
  },
  header: {
    position: "relative",
    top: 0,
    backgroundColor: Colors.PRIMARY,
    padding: "10px",
    color: theme.palette.common.white,
    borderRadius: "5px 5px 0 0",
    height: "50px",
  },
  container: {
    width: "100%",
    height: "350px",
    overflowY: "auto",
  },
  fileCard: {
    backgroundColor: Colors.LIGHT_SHADE,
    borderRadius: "5px",
    padding: "5px",
    margin: "15px 10px",
    boxShadow: theme.shadows[3],
    "& > p": {
      margin: 0,
      textOverflow: "ellipsis",
      maxWidth: "270px",
      display: "block",
      overflow: "hidden",
      whiteSpace: "nowrap",
    },
    position: "relative",
  },
  cancel: {
    "& > p": {
      maxWidth: "180px",
    },
  },
  cancelBtn: {
    position: "absolute",
    top: "5px",
    right: "5px",
  },
}));

const UploadQueue: React.FC<{}> = () => {
  const cls = useStyles();
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
    <AnimatePresence>
      {open && !isMobile && (
        <motion.div
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          exit={{ y: 400 }}
          className={clsx(cls.root, minimized && cls.minimized)}
        >
          <div className={cls.header}>
            <h2 style={{ margin: 0, float: "left" }}>Upload Queue</h2>
            <IconButton
              onClick={toggleMinimized}
              style={{ color: "white", float: "right", padding: 0 }}
            >
              <MinimizeIcon />
            </IconButton>
          </div>
          <div className={cls.container}>
            <AnimateSharedLayout>
              {uploadService.pending?.map(({ file, id }: WrappedFile) => (
                <motion.div
                  layout
                  key={id}
                  className={clsx(
                    cls.fileCard,
                    uploadService.currentUpload === id && cls.cancel
                  )}
                >
                  <p>{file.name}</p>
                  <p>{formatFileSize(file.size)}</p>
                  {uploadService.currentUpload === id && (
                    <Button
                      className={cls.cancelBtn}
                      variant="danger"
                      onClick={() => uploadService.cancel(id)}
                    >
                      Cancel
                    </Button>
                  )}
                  <LinearProgress
                    variant="determinate"
                    value={(uploadService.getProgress(id) || 0) * 100}
                  />
                </motion.div>
              ))}
            </AnimateSharedLayout>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UploadQueue as React.FC<{}>;
