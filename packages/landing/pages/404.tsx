import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Center from "../src/components/Center";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100vw",
    height: "100vh",
    backgroundColor: "#F1F3F9",
  },
  message: {
    userSelect: "none",
    opacity: 0.5,
  },
}));

const Custom404: React.FC<{}> = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Center>
        <p className={classes.message}>🙁 Oops</p>
        <h1>404 | Page Not Found</h1>
      </Center>
    </div>
  );
};
export default Custom404;
