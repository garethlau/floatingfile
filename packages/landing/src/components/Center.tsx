import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: "table",
    width: "100%",
    height: "100%",
  },
  content: {
    display: "table-cell",
    verticalAlign: "middle",
    textAlign: "center",
  },
}));

const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      <div className={classes.content}>{children}</div>
    </div>
  );
};

export default Center;
