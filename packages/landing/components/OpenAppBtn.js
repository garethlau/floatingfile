import React from "react";
import { Colors, BoxShadows } from "../constants";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import useWindowWidth from "../hooks/useWindowWidth";
const appUrl = "https://app.floatingfile.space";

const useStyles = makeStyles({
  root: {
    // background: `linear-gradient(45deg, ${Colors.WHITE} 30%, ${Colors.LIGHT_ACCENT} 90%)`,
    backgroundColor: Colors.WHITE,
    border: 0,
    borderRadius: 3,
    // boxShadow: "0 3px 5px 2px $",
    boxShadow: BoxShadows.TWO,
    color: Colors.MAIN_BRAND,
    height: 32,
    padding: "10px 30px",
    fontWeight: "bold",
    textTransform: "inherit",
    "&:hover": {
      boxShadow: BoxShadows.THREE,
      backgroundColor: Colors.WHITE,
    },
  },
});

export default function OpenAppBtn() {
  const windowWidth = useWindowWidth();
  const cls = useStyles();
  return (
    <Button variant="contained" href={appUrl} className={cls.root}>
      {windowWidth > 960
        ? "Open floatingfile in your browser"
        : "Open floatingfile"}
    </Button>
  );
}
