import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  colors: {
    blue: {
      "50": "#EAEDFA",
      "100": "#C5CDF1",
      "200": "#A0ADE8",
      "300": "#7C8DDF",
      "400": "#576DD6",
      "500": "#324DCD",
      "600": "#283EA4",
      "700": "#1E2E7B",
      "800": "#141F52",
      "900": "#0A0F29",
    },
    white: "#ffffff",
    black: "#000000",
    lightShade: "#f1f3f9",
    lightAccent: "#97b1d4",
    mainBrand: "#4560f6",
    darkAccent: "#927dd1",
    darkShade: "#34448e",
    primary: "#435ee9",
    secondary: "#324495",
    success: "#30ba8e",
    warning: "#ffc252",
    danger: "#f44336",
  },
  fonts: {
    body: "DM Sans",
    heading: "DM Sans",
  },
});
