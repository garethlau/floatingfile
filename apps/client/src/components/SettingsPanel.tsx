import React from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { Colors } from "@floatingfile/ui";
import { useParams } from "react-router-dom";
import useSpace from "../hooks/useSpace";
import { formatFileSize } from "../utils";
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

interface SettingsPanelProps {
  collapsed?: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ collapsed }) => {
  const cls = useStyles();
  const { code }: { code: string } = useParams();
  const { space } = useSpace(code);

  const size = 200;
  const capacity = 1000;
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
            <>
              <StyledLinearProgress
                variant="determinate"
                value={(size * 100) / capacity}
              />
              <p>
                {formatFileSize(size)} of {formatFileSize(capacity)} used
              </p>
              <p>{((size * 100) / capacity).toFixed(1)}%</p>
              <Button variant="primary">Upgrade</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel as React.FC<SettingsPanelProps>;
