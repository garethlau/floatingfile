import React from "react";
import styles from "./styles.module.css";
import Center from "../Center";

export default function ComingSoon() {
  return (
    <div className={styles.root}>
      <Center>
        <p className={styles.title}>Coming Soon</p>
        <p className={styles.sub}>Please come back some other time.</p>
      </Center>
    </div>
  );
}
