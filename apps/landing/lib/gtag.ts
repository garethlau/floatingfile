export const GA_TRACKING_ID = "UA-159864166-1";

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: URL): void => {
  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};

export default {
  pageview,
};
