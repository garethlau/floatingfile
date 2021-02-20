import React from "react";
import styles from "./styles.module.css";

export default function Scrollable(props) {
  return <div className={styles.root}>{props.children}</div>;
}
