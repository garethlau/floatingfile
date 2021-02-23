import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Colors, Elevation } from "@floatingfile/common";
import { useHistory } from "react-router-dom";
import clsx from "clsx";

interface NavTileProps {
  children: React.ReactNode;
  collapsed: boolean;
  name: string;
  baseUrl: string;
  active: boolean;
  url: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    width: "100%",
    color: Colors.WHITE,

    transition: "ease 0.3s",
    "&:hover": {
      cursor: "pointer",
      boxShadow: Elevation.TWO,
    },
  },
  active: {
    backgroundColor: Colors.WHITE,
    color: Colors.MAIN_BRAND,
    boxShadow: Elevation.FOUR,
  },

  centerWrapper: {
    display: "table",
    height: "100%",
    width: "100%",
  },
  center: {
    display: "table-cell",
    verticalAlign: "middle",
    textAlign: "center",
  },
}));

const NavTile: React.FC<NavTileProps> = ({
  children,
  name,
  collapsed,
  baseUrl,
  active,
  url,
  ...others
}) => {
  const cls = useStyles();
  const history = useHistory();

  return (
    <div
      onClick={() => history.push(url)}
      className={clsx(cls.root, active && cls.active)}
      {...others}
    >
      <div className={cls.centerWrapper}>
        <div className={cls.center}>{children}</div>
      </div>
    </div>
  );
};

export default NavTile;
