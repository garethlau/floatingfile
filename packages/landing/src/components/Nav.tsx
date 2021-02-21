import React from "react";
import Container from "./Container";
import Link from "next/link";
import { useRouter } from "next/router";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: theme.shadows[2],
    position: "fixed",
    top: 0,
    width: "100%",
    backgroundColor: "#4560f6",
    height: "64px",
    zIndex: 10,
    "& > a": {
      "-webkit-tap-highlight-color": "transparent",
    },
  },
  item: {
    display: "block",
    padding: "5px 10px",
    fontWeight: 500,
    color: "#FFFFFF",
    fontSize: "16px",
    textDecoration: "none",
    marginTop: "15px",
  },
  brand: {
    float: "left",
  },
  active: {
    borderBottom: "solid",
  },
  link: {
    float: "right",
  },
}));

const links = [
  { text: "Changelog", path: "/changelog" },
  { text: "Download", path: "/download" },
];

const Nav: React.FC<{}> = () => {
  const router = useRouter();
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Container>
        <Link href="/">
          <a
            className={clsx(
              classes.item,
              classes.brand,
              router.pathname === "/" && classes.active
            )}
          >
            floatingfile
          </a>
        </Link>
        {links.map((link, index) => {
          return (
            <Link href={link.path} key={index}>
              <a
                className={clsx(
                  classes.item,
                  classes.link,
                  router.pathname === link.path && classes.active
                )}
              >
                {link.text}
              </a>
            </Link>
          );
        })}
      </Container>
    </div>
  );
};
export default Nav;
