import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Colors } from "@floatingfile/ui";
import Center from "./Center";

const useStyles = makeStyles(() => ({
  page: {
    width: "100vw",
    height: "100vh",
    backgroundColor: Colors.LIGHT_SHADE,
  },
}));

const SpaceNotFound: React.FC<{}> = () => {
  const classes = useStyles();

  return (
    <div className={classes.page}>
      <Center>
        <p style={{ opacity: 0.5 }}>
          <span
            role="img"
            aria-label="Frowny face emoji"
            aria-labelledby="Frowny face emoji"
          >
            🙁{" "}
          </span>
          Oops!
        </p>
        <p style={{ opacity: 0.5 }}>
          It seems that the space you are trying to access does not exist.{" "}
        </p>
        <p style={{ opacity: 0.5 }}>Please double check the code.</p>
      </Center>
    </div>
  );
};

export default SpaceNotFound;
