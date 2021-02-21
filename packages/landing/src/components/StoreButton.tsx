import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  link: {
    textDecoration: "none",
    color: "#000000",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: "5px",
    width: "160px",
    padding: "5px 10px",
    boxShadow: theme.shadows[1],
    margin: "auto",
    transition: "ease 0.3s",
    "&:hover": {
      cursor: "pointer",
      boxShadow: theme.shadows[3],
    },
  },
  disabled: {
    opacity: 0.6,
    userSelect: "none",
    boxShadow: theme.shadows[0],
  },
  logo: {
    float: "left",
    height: "32px",
    marginTop: "3px",
    marginRight: "7px",
  },
  text: {
    float: "left",
    textAlign: "left",
  },
}));

interface StoreButtonProps {
  store: "apple" | "google";
  disabled?: boolean;
}

const stores = {
  apple: {
    logo: "apple-logo.svg",
    url: "https://itunes.apple.com/app/id1507080982",
    subtitle: "Download on the",
    name: "App Store",
  },
  google: {
    logo: "google-play-store.svg",
    url: "",
    subtitle: "GET IT ON",
    name: "Google Play",
  },
};

const StoreButton: React.FC<StoreButtonProps> = ({ store, disabled }) => {
  const classes = useStyles();

  const btn = (
    <div className={clsx(classes.container, disabled && classes.disabled)}>
      <img className={classes.logo} src={`/logos/${stores[store].logo}`} />

      <div className={classes.text}>
        <p style={{ margin: 0, opacity: 0.7, fontSize: "12px" }}>
          {stores[store].subtitle}
        </p>
        <p style={{ margin: 0, fontWeight: 600 }}>{stores[store].name}</p>
      </div>
      <div style={{ clear: "both" }}></div>
    </div>
  );

  if (disabled) {
    return btn;
  }
  return (
    <a href={stores[store].url} target="_blank" className={clsx(classes.link)}>
      {btn}
    </a>
  );
};
export default StoreButton;
