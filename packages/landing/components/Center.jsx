import React from "react";
import styles from "../styles/Center.module.css";
export default function Center(props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>{props.children}</div>
    </div>
  );
}
