import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Colors, BoxShadows } from "../constants";

import Icon from "@mdi/react";
import {
  mdiSpeedometer,
  mdiShieldAccount,
  mdiAccountGroup,
  mdiGamepadCircle,
  mdiCheckboxBlankCircleOutline,
} from "@mdi/js";
import EnterInView from "../wrappers/EnterInView";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "grid",
    gridTemplateRows: "repeat(4, 1fr)",
    gridTemplateColumns: "auto",
    maxWidth: "960px",
    margin: "auto",
    gridColumnGap: "20px",
    gridRowGap: "20px",
    padding: "20px",
    marginBottom: "100px",
    [theme.breakpoints.up("sm")]: {
      gridTemplateColumns: "1fr 1fr",
      gridTemplateRows: "1fr 1fr",
    },
    [theme.breakpoints.up("md")]: {
      gridTemplateColumns: "repeat(4, 1fr)",
      gridTemplateRows: "auto",
    },
  },
  card: {
    backgroundColor: Colors.WHITE,
    height: "200px",
    width: "90%",
    boxShadow: BoxShadows.TWO,
    borderRadius: "10px",
    gridTemplateRows: "32px auto",
    padding: "10px",
    margin: "auto",
    [theme.breakpoints.up("sm")]: {
      width: "200px",
      ["&:nth-child(odd)"]: {
        margin: "0 0 0 auto",
      },
      ["&:nth-child(even)"]: {
        margin: "0 auto 0 0",
      },
    },
  },
  icon: {
    color: Colors.MAIN_BRAND,
  },
  title: {
    color: Colors.MAIN_BRAND,
    fontWeight: "bold",
    marginBottom: 0,
  },
  body: {
    marginTop: 0,
  },
}));

const features = [
  {
    icon: mdiCheckboxBlankCircleOutline,
    title: "Clutter Free",
    body: "Keep your inboxes and chat history clear of temporary files.",
  },
  {
    icon: mdiShieldAccount,
    title: "No Accounts",
    body:
      "No accounts means you can use floatingfile to the fullest on any device, any where.",
  },
  {
    icon: mdiGamepadCircle,
    title: "Collaborative",
    body: "Anyone in the space can contribute files. Perfect for group work.",
  },
  {
    icon: mdiSpeedometer,
    title: "Fast",
    body:
      "Join with a 6 character code or by scanning a QR code. Reduce your file transfer workflow to seconds.",
  },
];

export default function HighlightFeatures() {
  const cls = useStyles();
  return (
    <div className={cls.root}>
      {features.map((feature, index) => {
        return (
          <div key={index} className={cls.card}>
            <div>
              <Icon path={feature.icon} size={"42px"} className={cls.icon} />
            </div>
            <div>
              <h3 className={cls.title}>{feature.title}</h3>
              <p className={cls.body}>{feature.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
