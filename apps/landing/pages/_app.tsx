import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import React, { useEffect } from "react";
import Head from "next/head";
import { DefaultSeo } from "next-seo";
import { ChakraProvider, LightMode } from "@chakra-ui/react";
import { theme } from "@floatingfile/ui";
import { useRouter } from "next/router";
import gtag from "lib/gtag";

// This default export is required in a new `pages/_app.js` file.
const App: React.FC<{ Component: any; pageProps: any }> = ({
  Component,
  pageProps,
}) => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: URL) => {
      /* invoke analytics function only for production */
      if (process.env.NODE_ENV === "production") gtag.pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

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
                url: "https://floatingfile.space/banners/banner1-white-600x600.jpg",
                width: 600,
                height: 600,
                alt: "Welcome to floatingfile",
              },
              {
                url: "https://floatingfile.space/banners/banner1-blue-600x600.jpg",
                width: 600,
                height: 600,
                alt: "Welcome to floatingfile",
              },

              {
                url: "https://floatingfile.space/banners/banner2-white-1200x600.jpg",
                width: 1200,
                height: 600,
                alt: "Welcome to floatingfile",
              },
              {
                url: "https://floatingfile.space/banners/banner2-blue-1200x600.jpg",
                width: 1200,
                height: 600,
                alt: "Welcome to floatingfile",
              },
              {
                url: "https://floatingfile.space/banners/banner3-white-1200x600.jpg",
                width: 1200,
                height: 600,
                alt: "Welcome to floatingfile",
              },
              {
                url: "https://floatingfile.space/banners/banner3-blue-1200x600.jpg",
                width: 1200,
                height: 600,
                alt: "Welcome to floatingfile",
              },
            ],
            site_name: "floatingfile",
          }}
        />
        <title>floatingfile</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ChakraProvider theme={theme}>
        <LightMode>
          <Component {...pageProps} />
        </LightMode>
      </ChakraProvider>
    </React.Fragment>
  );
};

export default App;
