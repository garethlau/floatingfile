import "../styles.css";
import { DefaultSeo } from "next-seo";

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
	return (
		<>
			<DefaultSeo
				description={"Simplify your file transfer workflow."}
				canonical={"https://www.floatingfile.space"}
				openGraph={{
					url: "https://www.floatingfile.space",
					title: "floatingfile",
					description: "Simplify your file transfer workflow.",
					images: [
						{
							url: "https://floatingfile.space/images/banners/banner1-white-600x600.jpg",
							width: 600,
							height: 600,
							alt: "Welcome to floatingfile",
						},
						{
							url: "https://floatingfile.space/images/banners/banner1-blue-600x600.jpg",
							width: 600,
							height: 600,
							alt: "Welcome to floatingfile",
						},

						{
							url: "https://floatingfile.space/images/banners/banner2-white-1200x600.jpg",
							width: 1200,
							height: 600,
							alt: "Welcome to floatingfile",
						},
						{
							url: "https://floatingfile.space/images/banners/banner2-blue-1200x600.jpg",
							width: 1200,
							height: 600,
							alt: "Welcome to floatingfile",
						},
						{
							url: "https://floatingfile.space/images/banners/banner3-white-1200x600.jpg",
							width: 1200,
							height: 600,
							alt: "Welcome to floatingfile",
						},
						{
							url: "https://floatingfile.space/images/banners/banner3-blue-1200x600.jpg",
							width: 1200,
							height: 600,
							alt: "Welcome to floatingfile",
						},
					],
					site_name: "floatingfile",
				}}
			/>
			<Component {...pageProps} />
		</>
	);
}
