import { createMuiTheme } from "@material-ui/core/styles";

export const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#435ee9",
    },
    secondary: {
      main: "#19857b",
    },
    error: {
      main: "#f44336",
    },
    success: {
      main: "#30ba8e",
    },
    background: {
      default: "#f1f3f9",
    },
  },
  typography: {
    fontFamily: "DM Sans",
    fontSize: 16,
  },
});
