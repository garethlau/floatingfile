import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
  },
  bottom: {
    color: "#6798e5",
    animationDuration: "550ms",
    position: "absolute",
    left: 0,
  },
  top: {
    color: "#1a90ff",
  },
}));

export default function GCircularProgress(props) {
  const cls = useStyles();
  return (
    <div className={cls.root}>
      <CircularProgress
        variant="determinate"
        value={100}
        className={cls.top}
        size={24}
        thickness={4}
        {...props}
      />
      <CircularProgress
        variant="indeterminate"
        disableShrink
        className={cls.bottom}
        size={24}
        thickness={4}
        {...props}
      />
    </div>
  );
}
