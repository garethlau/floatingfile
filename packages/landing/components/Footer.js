import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "./Container";
import Center from "./Center";
import Link from "next/link";
import { Colors } from "../constants";

const exploreLinks = [
  { text: "For Developers", path: "/docs/v4" },
  { text: "Change Log", path: "/changelog" },
  { text: "Frequently Asked Questions", path: "/faq" },
  { text: "Download", path: "/download" },
];
const resourceLinks = [
  { text: "Terms of Service", path: "/terms" },
  { text: "Privacy Policy", path: "/privacy" },
  // { text: "Cookie Policy", path: "/cookie" },
];

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: Colors.LIGHT_SHADE,
  },
  content: {
    display: "grid",
    gridTemplateRows: "auto auto auto",
    gridTemplateColumns: "1fr",
    padding: "20px",
    minHeight: "175px",
    [theme.breakpoints.up("md")]: {
      gridTemplateRows: "1fr",
      gridTemplateColumns: "1fr 250px 250px",
    },
  },
  groupTitle: {
    color: Colors.PRIMARY,
    margin: 0,
    fontWeight: 600,
  },
  link: {
    margin: 0,
    opacity: 0.7,
    transition: "ease 0.3s",
    "&:hover": {
      cursor: "pointer",
      opacity: 1,
    },
  },
}));

export default function Footer() {
  const cls = useStyles();
  return (
    <footer className={cls.root}>
      <Container>
        <div className={cls.content}>
          <Center>
            <img
              alt="floatingfile icon"
              style={{ float: "left", height: "48px", marginRight: "20px" }}
              src="/floatingfile.png"
            />
            <div style={{ textAlign: "left", float: "left" }}>
              <h3 className={cls.groupTitle}>floatingfile</h3>
              <p style={{ margin: "0" }}>File transfer, simplified.</p>
            </div>
          </Center>
          <div style={{ marginTop: "20px" }}>
            <h3 className={cls.groupTitle}>Explore</h3>
            {exploreLinks.map((link, index) => {
              return (
                <Link href={link.path} key={index}>
                  <p className={cls.link}>{link.text}</p>
                </Link>
              );
            })}
          </div>
          <div style={{ marginTop: "20px" }}>
            <h3 className={cls.groupTitle}>Resources</h3>
            {resourceLinks.map((link, index) => {
              return (
                <Link href={link.path} key={index}>
                  <p className={cls.link}>{link.text}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
    </footer>
  );
}
