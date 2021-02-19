import React from "react";
import Center from "../Center";
import styles from "./styles.module.css";

export default function GooglePlayStoreBtn() {
	return (
		<div className={styles.root}>
			<Center>
				<img src="/logos/google-play-store.svg" style={{ height: "32px" }} />
			</Center>
			<div style={{ textAlign: "left" }}>
				<p style={{ margin: 0, opacity: 0.7, fontSize: "12px" }}>GET IT ON</p>
				<p style={{ margin: 0, fontWeight: 600 }}>Google Play</p>
			</div>
		</div>
	);
}
