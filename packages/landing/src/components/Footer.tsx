import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "./Container";
import Link from "next/link";
import { Colors } from "../constants";
import Grid from "@material-ui/core/Grid";

const resources = [
  {
    heading: "Explore",
    links: [
      { text: "Changelog", path: "/changelog" },
      { text: "Frequently Asked Questions", path: "/faq" },
      { text: "Download", path: "/download" },
    ],
  },
  {
    heading: "Developers",
    links: [
      { text: "API Documentation", path: "/docs/v4" },
      { text: "Repository", href: "https://github.com/garethlau/floatingfile" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { text: "Terms of Service", path: "/terms" },
      { text: "Privacy Policy", path: "/privacy" },
    ],
  },
];

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: Colors.LIGHT_SHADE,
    padding: "20px",
  },
  brand: {
    minHeight: "100px",
  },
  content: {
    display: "grid",
    gridTemplateRows: "auto auto auto",
    gridTemplateColumns: "1fr",
    minHeight: "175px",
    [theme.breakpoints.up("md")]: {
      gridTemplateRows: "1fr",
      gridTemplateColumns: "1fr 250px 250px 250px",
    },
  },
  icon: {
    float: "left",
    height: "48px",
    marginRight: "20px",
  },
  heading: {
    color: Colors.PRIMARY,
    margin: 0,
    fontWeight: 600,
  },
  link: {
    margin: 0,
    opacity: 0.7,
    display: "block",
    textDecoration: "none",
    color: "#000000",
    transition: "ease 0.3s",
    "&:hover": {
      cursor: "pointer",
      opacity: 1,
    },
  },
}));

const Footer: React.FC<{}> = () => {
  const classes = useStyles();
  return (
    <footer className={classes.root}>
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={6} className={classes.brand}>
            <img
              alt="floatingfile icon"
              className={classes.icon}
              src="/floatingfile.png"
            />
            <div style={{ textAlign: "left", float: "left" }}>
              <h3 className={classes.heading}>floatingfile</h3>
              <p style={{ margin: "0" }}>File transfer, simplified.</p>
            </div>
          </Grid>
          <Grid container spacing={3} item xs={12} md={6}>
            {resources.map(({ heading, links }, index) => (
              <Grid item md={6} sm={6} xs={12} key={index}>
                <h3 className={classes.heading}>{heading}</h3>
                {links.map(({ text, href, path }, index) =>
                  path ? (
                    <Link key={index} href={path}>
                      <a className={classes.link}>{text}</a>
                    </Link>
                  ) : (
                    <a key={index} href={href} className={classes.link}>
                      {text}
                    </a>
                  )
                )}
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Container>
    </footer>
  );
};

export default Footer;
