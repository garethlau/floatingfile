import React from "react";
import { makeStyles } from "@material-ui/core/styles";

interface GInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  center?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  style: React.CSSProperties;
}

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

const GInput: React.FC<GInputProps> = ({
  placeholder,
  center,
  fullWidth,
  style,
  ...other
}) => {
  const cls = useStyles();
  return (
    <input
      className={cls.root}
      style={{
        textAlign: center ? "center" : "left",
        width: fullWidth ? "-webkit-fill-available" : "auto",
        ...style,
      }}
      type="text"
      {...other}
    />
  );
};

export default GInput;
