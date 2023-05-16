export const MEASUREMENT_ID = "G-10HHH4M5JB";

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: URL): void => {
  window.gtag("config", MEASUREMENT_ID, {
    page_path: url,
  });
};

export default {
  pageview,
};
