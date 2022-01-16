import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  root: {
    display: "table",
    height: "100%",
    width: "100%",
  },

  content: {
    display: "table-cell",
    verticalAlign: "middle",
    textAlign: "center",
  },
}));

const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cls = useStyles();
  return (
    <div className={cls.root}>
      <div className={cls.content}>{children}</div>
    </div>
  );
};

export default Center;
