import React from "react";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import AppStoreBtn from "../components/AppStoreBtn";
import { NextSeo } from "next-seo";
import { makeStyles } from "@material-ui/core/styles";
import { Colors, BoxShadows } from "../constants";
import useWindowWidth from "../hooks/useWindowWidth";
import { motion } from "framer-motion";
import EnterInView from "../wrappers/EnterInView";

const useStyles = makeStyles((theme) => ({
	root: {
		paddingTop: "64px",
		backgroundColor: Colors.LIGHT_SHADE,
		minHeight: "calc(100vh - 100px)",
	},
	title: {
		textAlign: "center",
		"& > h1": {
			marginTop: "50px",
		},
		maxWidth: "960px",
		width: "90%",
		margin: "auto",
	},
	imgContainer: {
		textAlign: "center",
	},
	imgDesktop: {
		maxWidth: "960px",
		borderRadius: "10px",
		boxShadow: BoxShadows.TWO,
		width: "90%",
		display: "none",
		[theme.breakpoints.up("sm")]: {
			display: "inherit",
		},
	},
	imgMobile: {
		width: "100%",
		[theme.breakpoints.up("sm")]: {
			display: "none",
		},
	},
}));

export default function DownloadPage() {
	const cls = useStyles();
	const windowWidth = useWindowWidth();

	return (
		<>
			<NextSeo
				title={"floatingfile | Download"}
				description={"Download floatingfile on your device!"}
				canonical={"https://www.floatingfile.space"}
				openGraph={{
					url: "https://www.floatingfile.space/download",
					title: "floatingfile | Download",
					description: "Download floatingfile on your device!",
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
			<div className={cls.root}>
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
					<div className={cls.title}>
						<h1>Download</h1>
						<p>Get floatingfile for your iOS device for a smooth, feature-rich experience.</p>
					</div>
				</motion.div>
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
								delay: 0.5,
							},
						},
					}}
				>
					<div className={cls.imgContainer}>
						<picture>
							<source type="image/webp" srcSet={"/images/ios-app.webp"} />
							<source type="image/png" srcSet={"/images/ios-app.png"} />
							<img alt="Screenshots of iOS application" className={cls.imgDesktop} src={"/images/ios-app.png"} />
						</picture>

						<picture>
							<source type="image/webp" srcSet={"/images/space-ui-ios.webp"} />
							<source type="image/png" srcSet={"/images/space-ui-ios.png"} />
							<img alt="Screenshots of iOS application" className={cls.imgMobile} src={"/images/space-ui-ios.png"} />
						</picture>
					</div>
				</motion.div>
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
								delay: 1,
							},
						},
					}}
				>
					<div>
						<div style={{ margin: "auto", padding: "30px", width: "min-content" }}>
							<AppStoreBtn />
						</div>
					</div>
				</motion.div>
			</div>
			<Footer />
		</>
	);
}
