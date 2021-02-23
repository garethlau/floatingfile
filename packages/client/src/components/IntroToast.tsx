import React from "react";
import Button from "./Button";
import { USERNAME_STORAGE_KEY } from "../env";

const IntroToast: React.FC<{
  handleClose: React.MouseEventHandler<HTMLButtonElement>;
}> = ({ handleClose }) => {
  const username = localStorage.getItem(USERNAME_STORAGE_KEY || "");

  return (
    <div style={{ maxWidth: "400px" }}>
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
        {`Your randomly generated nickname is: ${username} Please be aware that anyone can download your files long as they are in the space. Files are automatically deleted after 60 minutes.`}
      </p>
      <Button variant="primary" onClick={handleClose} debounce={5}>
        Got It
      </Button>
    </div>
  );
};

export default IntroToast;
