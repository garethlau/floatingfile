import React, { useState } from "react";
import { makeStyles } from "@material-ui/core";
import Center from "./Center";
import MoonLoader from "react-spinners/MoonLoader";
import { Colors } from "@floatingfile/common";

const useStyles = makeStyles({
  page: {
    width: "100vw",
    height: "100vh",
    backgroundColor: Colors.LIGHT_SHADE,
  },
});

const phrases: string[] = [
  "Getting things ready...",
  "Preparing the space...",
  "This shouldn't take too long...",
  "Just a moment...",
  "Warming up the space...",
];

const FullPageLoader: React.FC = () => {
  const [rand] = useState(() => Math.floor(Math.random() * phrases.length));
  const cls = useStyles();

  return (
    <div className={cls.page}>
      <Center>
        <p style={{ opacity: 0.5 }}>{phrases[rand]}</p>
        <MoonLoader css="margin: auto;" color={Colors.MAIN_BRAND} size={32} />
      </Center>
    </div>
  );
};

export default FullPageLoader;
