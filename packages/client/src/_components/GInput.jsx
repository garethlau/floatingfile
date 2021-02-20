import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "5px 10px",
    borderRadius: "5px",
    border: "1px solid grey",
    "&:focus": {
      outline: "none",
    },
    fontSize: "16px",
    fontFamily: "DM Sans",
  },
}));

export default function GInput(props) {
  const cls = useStyles();
  const { placeholder, center, fullWidth, style, ...other } = props;
  return (
    <input
      className={cls.root}
      placeholder={placeholder}
      style={{
        textAlign: center ? "center" : "left",
        width: fullWidth ? "-webkit-fill-available" : "auto",
        ...style,
      }}
      type="text"
      {...other}
    />
  );
}
