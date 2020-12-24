import fs from "fs";
import path from "path";
import { NextSeo } from "next-seo";
import styles from "../styles/slug.module.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

import Icon from "@mdi/react";
import { mdiLock, mdiFileDocument } from "@mdi/js";
import { motion } from "framer-motion";

export default function Post({ data }) {
	const { content, title, iconType, lastUpdated, seo } = data;

	function renderIcon(iconType) {
		switch (iconType) {
			case "mdiLock":
				return <Icon path={mdiLock} size={"42px"} className={styles.icon} />;
			case "mdiFileDocument":
				return <Icon path={mdiFileDocument} size="42px" className={styles.icon} />;
			default:
				return null;
		}
	}

	return (
		<>
			<NextSeo
				title={seo.title}
				description={seo.description}
				canonical={seo.url}
				openGraph={{
					url: seo.url,
					title: seo.title,
					description: seo.description,
					images: [
						{
							url: "https://floatingfile.space/images/landing-banner.png",
							width: 1200,
							height: 630,
							alt: "Use floatingfile today!",
						},
					],
					site_name: "floatingfile",
				}}
			/>
			<div className={styles.root}>
				<NavBar />
				<motion.div
					initial="hidden"
					animate="visible"
					variants={{
						hidden: {
							opacity: 0,
							y: 50,
						},
						visible: {
							y: 0,
							opacity: 1,
							transition: {
								delay: 0.2,
							},
						},
					}}
				>
					<div className={styles.content}>
						<div className={styles.page}>
							<div className={styles.iconContainer}>{renderIcon(iconType)}</div>
							<h1 className={styles.title}>{title}</h1>
							<p className={styles.datetime}>Last Updated: {lastUpdated}</p>

							{content.map((x, index) => {
								if (x.variant === "header") {
									return <h2 key={index}>{x.text}</h2>;
								} else if (x.href && x.variant === "li") {
									return (
										<li key={index}>
											<a href={x.href}>{x.text}</a>
										</li>
									);
								} else if (x.variant === "body") {
									return <p key={index}>{x.text}</p>;
								} else if (x.variant === "li") {
									return <li key={index}>{x.text}</li>;
								} else return <p key={index}>{x.text}</p>;
							})}
						</div>
					</div>
				</motion.div>

				<div style={{ marginTop: "50px" }}>
					<Footer />
				</div>
			</div>
		</>
	);
}

export async function getStaticPaths() {
	const filenames = fs.readdirSync("posts");
	const paths = filenames.map((filename) => ({ params: { slug: filename.replace(".json", "") } }));
	return {
		paths,
		fallback: false,
	};
}

export async function getStaticProps({ params: { slug } }) {
	const rawData = fs.readFileSync(path.join("posts", `${slug}.json`));
	const data = JSON.parse(rawData);
	return {
		props: {
			data,
		},
	};
}
