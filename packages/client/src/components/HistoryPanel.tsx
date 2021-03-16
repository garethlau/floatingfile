import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Colors, Elevation } from "@floatingfile/common";
import Center from "./Center";
import {
  mdiUpload,
  mdiDownload,
  mdiDelete,
  mdiTimerSandEmpty,
  mdiAccountPlus,
  mdiAccountMinus,
} from "@mdi/js";
import Icon from "@mdi/react";
import useSpace from "../queries/useSpace";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "grid",
    gridTemplateRows: "64px calc(100vh - 64px - 64px)",
    height: "100%",
    width: "100%",
    backgroundColor: Colors.WHITE,
    [theme.breakpoints.up("md")]: {
      gridTemplateRows: "64px calc(100vh - 64px)",
    },
  },
  title: {
    color: Colors.LIGHT_ACCENT,
    textAlign: "center",
    [theme.breakpoints.up("sm")]: {
      textAlign: "left",
      marginLeft: "20px",
    },
  },
  tileContainer: {
    overflowX: "hidden",
    [theme.breakpoints.up("md")]: {
      overflowY: "auto",
    },
  },
  tile: {
    display: "grid",
    borderRadius: "5px",
    gridTemplateColumns: "48px calc(100vw - 48px - 50px)",
    height: "52px",
    padding: "5px",
    margin: "10px",
    boxShadow: Elevation.ONE,
    backgroundColor: Colors.LIGHT_SHADE,
    [theme.breakpoints.up("md")]: {
      gridTemplateColumns: "48px 168px",
      margin: "5px",
      boxShadow: "none",
    },
  },
}));

function renderIcon(action: string) {
  let path = "";
  switch (action) {
    case "UPLOAD":
      path = mdiUpload;
      break;
    case "DOWNLOAD":
      path = mdiDownload;
      break;
    case "REMOVE":
      path = mdiDelete;
      break;
    case "LEAVE":
      path = mdiAccountMinus;
      break;
    case "JOIN":
      path = mdiAccountPlus;
      break;
    case "EXPIRED":
      path = mdiTimerSandEmpty;
      break;
    default:
      console.log(action);
  }
  return <Icon color={Colors.PRIMARY} path={path} size="24px" />;
}

function renderTile(action: string, payload: string, author: string) {
  switch (action) {
    case "EXPIRED":
      return (
        <>
          <p
            style={{
              marginTop: "10px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {payload}
          </p>
        </>
      );
    case "JOIN":
    case "LEAVE":
      return (
        <>
          <p
            style={{
              marginTop: "10px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {author}
          </p>
        </>
      );
    case "UPLOAD":
    case "DOWNLOAD":
    case "REMOVE":
    default:
      return (
        <>
          <p
            style={{
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {payload}
          </p>
          <p
            style={{
              margin: 0,
              opacity: 0.5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {author}
          </p>
        </>
      );
  }
}

const HistoryPanel: React.FC<{}> = () => {
  const { code }: { code: string } = useParams();
  const { data: space } = useSpace(code);
  const history = space?.history || [];

  const cls = useStyles();
  return (
    <div className={cls.root}>
      <h2 className={cls.title}>History</h2>
      <div className={cls.tileContainer}>
        {history && history.length > 0 ? (
          <AnimatePresence>
            {history
              .sort((a, b) => {
                return (
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
                );
              })
              .map(({ payload, author, action, timestamp }, index) => {
                return (
                  <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cls.tile}
                    key={timestamp}
                  >
                    <div>
                      <Center>{renderIcon(action)}</Center>
                    </div>
                    <div>{renderTile(action, payload, author)}</div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        ) : (
          <p style={{ opacity: 0.5, textAlign: "center", margin: "0 10px" }}>
            The history log will show up here.
          </p>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
