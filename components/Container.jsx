import React from "react";
import styles from "../styles/Container.module.css";

export default function Container(props) {
	return <div className={styles.root}>{props.children}</div>;
}
