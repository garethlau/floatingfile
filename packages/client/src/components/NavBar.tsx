import React, { useEffect, useState } from "react";
import PublicIcon from "@material-ui/icons/Public";
import HistoryIcon from "@material-ui/icons/History";
import PeopleIcon from "@material-ui/icons/People";
import FolderIcon from "@material-ui/icons/Folder";

import { useLocation } from "react-router-dom";
import SettingsIcon from "@material-ui/icons/Settings";
import NavTile from "./NavTile";
import clsx from "clsx";
import { Colors } from "@floatingfile/common";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  nav: {
    gridArea: "nav",
    backgroundColor: Colors.MAIN_BRAND,
    height: "100%",
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(5, 64px)",
    gridTemplateRows: "1fr",
    [theme.breakpoints.up("md")]: {
      gridTemplateColumns: "1fr",
      gridTemplateRows: "repeat(4, 80px)",
    },
  },

  filesTab: {
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
}));

const NavBar: React.FC<{
  baseUrl: string;
  size: "small" | "medium" | "large";
}> = ({ baseUrl, size }) => {
  const classes = useStyles();
  const [active, setActive] = useState<number>(1);

  const location = useLocation();
  useEffect(() => {
    const pathArr = location.pathname.split("/");
    const panel =
      pathArr.length === 3 ? "connect" : pathArr[pathArr.length - 1];
    console.log(panel);

    if (panel === "files") {
      if (size === "large") setActive(1);
      else setActive(0);
    } else if (panel === "connect") setActive(1);
    else if (panel === "history") setActive(2);
    else if (panel === "users") setActive(3);
    else if (panel === "settings") setActive(4);
  }, [location, size]);

  return (
    <div className={classes.nav}>
      {[
        { name: "/files", icon: <FolderIcon /> },
        { name: "", icon: <PublicIcon /> },
        { name: `/history`, icon: <HistoryIcon /> },
        { name: `/users`, icon: <PeopleIcon /> },
        // { name: "/settings", icon: <SettingsIcon /> },
      ].map(({ name, icon }, index) => (
        <div
          key={index}
          className={clsx(name === "/files" && classes.filesTab)}
        >
          <NavTile
            active={index === active}
            baseUrl={baseUrl}
            collapsed={size === "small" || size === "medium"}
            url={baseUrl + name}
            name={name}
          >
            {icon}
          </NavTile>
        </div>
      ))}
    </div>
  );
};

export default NavBar;
