import { NextSeo } from "next-seo";
import NavBar from "../components/NavBar";
import styles from "../styles/Changelog.module.css";
import Footer from "../components/Footer";
import EnterInView from "../wrappers/EnterInView";
import fs from "fs";
import path from "path";
import * as matter from "gray-matter";
import marked from "marked";

const Variants = {
	BODY: "BODY",
	BULLET: "BULLET",
	IMG: "IMG",
	LINE_BREAK: "LINE_BREAK",
	HEADER: "HEADER",
};

const WIP = [];

export default function ChangelogPage({ changelog }) {
	return (
		<>
			<NextSeo
				title={"floatingfile | Changelog"}
				description={"Stay up-to-date on changes to floatingfile."}
				openGraph={{
					url: "https://www.floatingfile.space/changelog",
					title: "floatingfile | Changelog",
					description: "Stay up-to-date on changes to floatingfile.",
				}}
			/>
			<NavBar />
			<div className={styles.root}>
				<div className={styles.titleContainer}>
					<h1 className={styles.title}>Changelog</h1>
				</div>
				<div className={styles.contentContainer}>
					{changelog.map((x, index) => {
						return (
							<EnterInView key={index}>
								<div className={styles.change}>
									<div className={styles.versionContainer}>
										<h2>{x.version}</h2>
									</div>
									<div className={styles.dateContainer}>{x.data.date}</div>
									<div className={styles.changesContainer}>
										<div dangerouslySetInnerHTML={{ __html: x.htmlString }} />
									</div>
								</div>
							</EnterInView>
						);
					})}
				</div>
			</div>
			<Footer />
		</>
	);
}

export async function getStaticProps() {
	const filenames = fs.readdirSync("content/changelog");
	const changelog = filenames
		.map((filename) => {
			const rawMd = fs.readFileSync(path.join("content", "changelog", filename));
			const parsedMd = matter(rawMd);
			const htmlString = marked(parsedMd.content);

			return {
				version: "v" + filename.replace(".md", ""),
				data: parsedMd.data,
				htmlString,
				filename,
			};
		})
		.filter((change) => !change.data.WIP);

	changelog
		.sort((a, b) =>
			a.version.replace(/\d+/g, (n) => +n + 100000).localeCompare(b.version.replace(/\d+/g, (n) => +n + 100000))
		)
		.reverse();

	return {
		props: {
			changelog,
		},
	};
}
