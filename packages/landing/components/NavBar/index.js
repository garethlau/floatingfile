import React from "react";
import styles from "./styles.module.css";
import Container from "../Container";
import Link from "next/link";
import { useRouter } from "next/router";

const links = [
	{ text: "Changelog", path: "/changelog" },
	{ text: "Download", path: "/download" },
];

export default function NavBar() {
	const router = useRouter();
	return (
		<div className={styles.root}>
			<Container>
				<Link href="/">
					<a className={`${styles.brand} ${router.pathname === "/" ? styles.active : ""}`}>floatingfile</a>
				</Link>
				{links.map((link, index) => {
					return (
						<Link href={link.path} key={index}>
							<a className={`${styles.link} ${router.pathname === link.path ? styles.active : ""}`}>{link.text}</a>
						</Link>
					);
				})}
			</Container>
		</div>
	);
}
