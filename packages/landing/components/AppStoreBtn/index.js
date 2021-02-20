import React from "react";
import Center from "../Center";
import styles from "./styles.module.css";

export default function AppStoreBtn() {
  return (
    <a
      href="https://itunes.apple.com/app/id1507080982"
      target="_blank"
      className={styles.a}
    >
      <div className={styles.root}>
        <Center>
          <img src="/logos/apple-logo.svg" style={{ height: "32px" }} />
        </Center>
        <div style={{ textAlign: "left" }}>
          <p style={{ margin: 0, opacity: 0.7, fontSize: "12px" }}>
            Download on the
          </p>
          <p style={{ margin: 0, fontWeight: 600 }}>App Store</p>
        </div>
      </div>
    </a>
  );
}
