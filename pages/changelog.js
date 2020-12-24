import { NextSeo } from "next-seo";
import NavBar from "../components/NavBar";
import styles from "../styles/Changelog.module.css";
import Footer from "../components/Footer";
import { changelog } from "../scaffold";
import EnterInView from "../wrappers/EnterInView";

const Variants = {
	BODY: "BODY",
	BULLET: "BULLET",
	IMG: "IMG",
	LINE_BREAK: "LINE_BREAK",
	HEADER: "HEADER",
};

const WIP = [];

export default function ChangelogPage() {
	return (
		<>
			<NextSeo
				title={"floatingfile | Changelog"}
				description={"Stay up-to-date on changes to floatingfile."}
				canonical={"https://www.floatingfile.space"}
				openGraph={{
					url: "https://www.floatingfile.space/changelog",
					title: "floatingfile | Changelog",
					description: "Stay up-to-date on changes to floatingfile.",
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
									<div className={styles.dateContainer}>{x.date}</div>
									<div className={styles.changesContainer}>
										{x.content.map((y, idx) => {
											if (y.variant === Variants.BULLET) {
												return (
													<li key={idx} className={styles.li}>
														{y.text}
													</li>
												);
											} else if (y.variant === Variants.IMG) {
												return (
													<picture key={idx}>
														<source type="image/webp" srcSet={y.src + ".webp"} />
														<img className={styles.img} src={y.src + ".png"} />
													</picture>
												);
											} else if (y.variant === Variants.LINE_BREAK) {
												return <hr key={idx}></hr>;
											} else if (y.variant === Variants.HEADER) {
												return (
													<p key={idx} className={styles.header}>
														{y.text}
													</p>
												);
											} else if (y.variant === Variants.BODY) {
												return (
													<p key={idx} className={styles.body}>
														{y.text}
													</p>
												);
											} else {
												return <div key={idx}>{y.text}</div>;
											}
										})}
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
