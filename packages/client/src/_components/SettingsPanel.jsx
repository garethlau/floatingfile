import React, { useEffect } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { Colors } from "../constants";
import { useParams } from "react-router-dom";
import useSpace from "../_queries/useSpace";
import { formatFileSize } from "../_utils/";
import LinearProgress from "@material-ui/core/LinearProgress";
import Button from "./Button";

const StyledLinearProgress = withStyles((theme) => ({
  root: {
    height: 10,
    borderRadius: 5,
  },
  colorPrimary: {
    backgroundColor:
      theme.palette.grey[theme.palette.type === "light" ? 200 : 700],
  },
  bar: {
    borderRadius: 5,
    backgroundColor: "#1a90ff",
  },
}))(LinearProgress);

const useStyles = makeStyles((theme) => ({
  root: {
    display: "grid",
    height: "100%",
    width: "100%",
    gridTemplateRows: "70px auto 200px",
  },
  title: {
    color: Colors.LIGHT_ACCENT,
    textAlign: "center",
    [theme.breakpoints.up("sm")]: {
      textAlign: "left",
      marginLeft: "20px",
    },
  },
  scrollContainer: {
    [theme.breakpoints.up("md")]: {
      overflowY: "auto",
    },
  },
  tile: {
    margin: "10px",
    borderRadius: "5px",
    padding: "5px",
    boxShadow: theme.shadows[5],
    [theme.breakpoints.up("md")]: {
      margin: "5px",
      boxShadow: "none",
    },
    "& > h4": {
      margin: "10px 0",
    },
  },
}));
export default function SettingsPanel({ collapsed }) {
  const cls = useStyles();
  const { code } = useParams();
  const { data: space } = useSpace(code);

  return (
    <div className={cls.root}>
      <h2 className={cls.title}>Settings</h2>
      <div className={cls.scrollContainer}>
        <div
          className={cls.tile}
          style={{
            backgroundColor: !collapsed ? Colors.LIGHT_SHADE : Colors.WHITE,
          }}
        >
          <h4>Storage</h4>
          {space && (
            <React.Fragment>
              <StyledLinearProgress
                variant="determinate"
                value={(parseInt(space.size) * 100) / parseInt(space.capacity)}
              />
              <p>
                {formatFileSize(space.size)} of {formatFileSize(space.capacity)}{" "}
                used
              </p>
              <p>{((space.size * 100) / space.capacity).toFixed(1)}%</p>
              <Button variant="primary">Upgrade</Button>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}
