import React from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { theme } from "@floatingfile/common";
import { DefaultSeo } from "next-seo";

// This default export is required in a new `pages/_app.js` file.
const App: React.FC<{ Component: any; pageProps: any }> = ({
  Component,
  pageProps,
}) => {
  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <DefaultSeo
          description={"Simplify your file transfer workflow."}
          canonical={"https://www.floatingfile.space"}
          openGraph={{
            url: "https://www.floatingfile.space",
            title: "floatingfile",
            description: "Simplify your file transfer workflow.",
            images: [
              {
                url:
                  "https://floatingfile.space/banners/banner1-white-600x600.jpg",
                width: 600,
                height: 600,
                alt: "Welcome to floatingfile",
              },
              {
                url:
                  "https://floatingfile.space/banners/banner1-blue-600x600.jpg",
                width: 600,
                height: 600,
                alt: "Welcome to floatingfile",
              },

              {
                url:
                  "https://floatingfile.space/banners/banner2-white-1200x600.jpg",
                width: 1200,
                height: 600,
                alt: "Welcome to floatingfile",
              },
              {
                url:
                  "https://floatingfile.space/banners/banner2-blue-1200x600.jpg",
                width: 1200,
                height: 600,
                alt: "Welcome to floatingfile",
              },
              {
                url:
                  "https://floatingfile.space/banners/banner3-white-1200x600.jpg",
                width: 1200,
                height: 600,
                alt: "Welcome to floatingfile",
              },
              {
                url:
                  "https://floatingfile.space/banners/banner3-blue-1200x600.jpg",
                width: 1200,
                height: 600,
                alt: "Welcome to floatingfile",
              },
            ],
            site_name: "floatingfile",
          }}
        />
        <title>My page</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </React.Fragment>
  );
};

export default App;
