import React from "react";
import { Colors, BoxShadows } from "../constants";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
const appUrl = "https://app.floatingfile.space";

const useStyles = makeStyles((theme) => ({
  root: {
    // background: `linear-gradient(45deg, ${Colors.WHITE} 30%, ${Colors.LIGHT_ACCENT} 90%)`,
    // backgroundColor: Colors.WHITE,
    border: 0,
    backgroundColor: "#4560f6",
    borderRadius: 3,
    // boxShadow: "0 3px 5px 2px $",
    boxShadow: theme.shadows[1],
    // color: Colors.MAIN_BRAND,
    color: "#FFFFFF",
    // height: 32,
    // padding: "10px 30px",
    // fontWeight: "bold",
    fontSize: "16px",
    textTransform: "inherit",
    "&:hover": {
      boxShadow: theme.shadows[3],
      backgroundColor: "#324ee8",
    },
  },
}));

const AppButton: React.FC<{}> = () => {
  const cls = useStyles();
  return (
    <Button variant="contained" href={appUrl} className={cls.root}>
      open floatingfile
    </Button>
  );
};

export default AppButton;
