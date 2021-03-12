import React from "react";
import Button from "./Button";
import { USERNAME_STORAGE_KEY } from "../env";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  container: {
    maxWidth: "400px",
  },
  button: {
    marginRight: "5px",
  },
}));

const IntroToast: React.FC<{
  handleClose: React.MouseEventHandler<HTMLButtonElement>;
}> = ({ handleClose }) => {
  const classes = useStyles();
  const username = localStorage.getItem(USERNAME_STORAGE_KEY || "");

  return (
    <div className={classes.container}>
      <p>
        Welcome to floatingfile
        <span
          role="img"
          aria-label="Waving hand emoji"
          aria-labelledby="Waving hand emoji"
        >
          👋
        </span>
      </p>
      <p>
        Your randomly generated nickname is: <b>{username}</b>. Please be aware
        that anyone can download your files long as they are in the space.
      </p>
      <Button
        className={classes.button}
        variant="primary"
        onClick={handleClose}
        debounce={5}
      >
        Got It
      </Button>
      <Button
        className={classes.button}
        variant="primary"
        inverse
        href="https://floatingfile.space/faq"
      >
        Learn More
      </Button>
    </div>
  );
};

export default IntroToast;
