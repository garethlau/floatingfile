export const VERSION = process.env.REACT_APP_VERSION || "3.4";
export const ENVIRONMENT = process.env.REACT_APP_ENVIRONMENT || "development";
export const BASE_API_URL =
  process.env.REACT_APP_BASE_API_URL || "http://localhost:5000";
export const USERNAME_STORAGE_KEY =
  process.env.REACT_APP_USERNAME_STORAGE_KEY || "username";
export const ORIGIN = process.env.REACT_APP_ORIGIN || "http://localhost:3000";
export const LAST_VISIT_STORAGE_KEY =
  process.env.REACT_APP_LAST_VISIT_STORAGE_KEY || "last-visited";

export const EVENT_SOURCE = `${
  ENVIRONMENT === "development" ? BASE_API_URL : ""
}/api/notifications`;

export const DD_CLIENT_TOKEN = "pub5487d657e6198edac333bbe1f68b0d26";
