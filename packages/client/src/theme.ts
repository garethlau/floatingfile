import { createMuiTheme } from "@material-ui/core";
import { theme as baseTheme } from "@floatingfile/common";

const theme = createMuiTheme({
  ...baseTheme,
  overrides: {
    MuiCssBaseline: {
      "@global": {
        html: {
          WebkitFontSmoothing: "auto",
        },
        "*::-webkit-scrollbar": {
          width: "7px",
          height: "7px",
        },
        "*::-webkit-scrollbar-track": {
          "-webkit-box-shadow": "inset 0 0 6px rgba(0, 0, 0, 0.3)",
          backgroundColor: "#f5f5f5",
        },
        "*::-webkit-scrollbar-thumb": {
          borderRadius: "5px",
          "-webkit-box-shadow": "inset 0 0 6px rgba(0, 0, 0, 0.3)",
          backgroundColor: "#4560f6",
        },
      },
    },
  },
});

export default theme;
