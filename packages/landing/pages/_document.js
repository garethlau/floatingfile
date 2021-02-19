import Document, { Html, Head, Main, NextScript } from "next/document";
import { ServerStyleSheets } from "@material-ui/styles";
import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles";

const theme = responsiveFontSizes(createMuiTheme());

class MyDocument extends Document {
	static async getInitialProps(ctx) {
		const initialProps = await Document.getInitialProps(ctx);
		return { ...initialProps };
	}

	render() {
		return (
			<Html>
				<Head>
					<link rel="apple-touch-icon" sizes="57x57" href="/favicons/apple-icon-57x57.png" />
					<link rel="apple-touch-icon" sizes="60x60" href="/favicons/apple-icon-60x60.png" />
					<link rel="apple-touch-icon" sizes="72x72" href="/favicons/apple-icon-72x72.png" />
					<link rel="apple-touch-icon" sizes="76x76" href="/favicons/apple-icon-76x76.png" />
					<link rel="apple-touch-icon" sizes="114x114" href="/favicons/apple-icon-114x114.png" />
					<link rel="apple-touch-icon" sizes="120x120" href="/favicons/apple-icon-120x120.png" />
					<link rel="apple-touch-icon" sizes="144x144" href="/favicons/apple-icon-144x144.png" />
					<link rel="apple-touch-icon" sizes="152x152" href="/favicons/apple-icon-152x152.png" />
					<link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-icon-180x180.png" />
					<link rel="icon" type="image/png" sizes="192x192" href="/favicons/android-icon-192x192.png" />
					<link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
					<link rel="icon" type="image/png" sizes="96x96" href="/favicons/favicon-96x96.png" />
					<link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
					<link rel="shortcut icon" href="/favicons/favicon.ico" />
					<link rel="manifest" href="/manifest.json" />
					<meta name="msapplication-TileColor" content="#ffffff" />
					<meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
					<meta name="theme-color" content="#ffffff" />
					<meta name="description" content="floatingfile" />

					<meta name="theme-color" content={theme.palette.primary.main} />

					<link
						href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap"
						rel="stylesheet"
					/>
					<meta charSet="utf-8" />
					<meta name="viewport" content="width=device-width,initial-scale=1" />
					<meta name="theme-color" content="#000000" />
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

MyDocument.getInitialProps = async (ctx) => {
	// Render app and page and get the context of the page with collected side effects.
	const sheets = new ServerStyleSheets();
	const originalRenderPage = ctx.renderPage;

	ctx.renderPage = () =>
		originalRenderPage({
			enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
		});

	const initialProps = await Document.getInitialProps(ctx);

	return {
		...initialProps,
		// Styles fragment is rendered after the app and page rendering finish.
		styles: [
			<React.Fragment key="styles">
				{initialProps.styles}
				{sheets.getStyleElement()}
			</React.Fragment>,
		],
	};
};

export default MyDocument;
