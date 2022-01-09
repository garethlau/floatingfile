import React, { useEffect, useState, Suspense } from "react";
import { makeStyles } from "@material-ui/core";
import { Router, Switch, Route } from "react-router-dom";
import { createBrowserHistory } from "history";
import { SnackbarProvider } from "notistack";
import { Breakpoints } from "./constants";
import { Colors, theme } from "@floatingfile/ui";
import {
  USERNAME_STORAGE_KEY,
  ENVIRONMENT,
  LAST_VISIT_STORAGE_KEY,
} from "./env";
import useWindowWidth from "./hooks/useWindowWidth";
import axios from "axios";
import ReactGA from "react-ga";
import { QueryClient, QueryClientProvider } from "react-query";
import { SelectedFilesProvider } from "./contexts/selectedFiles";
import { UploadServiceProvider } from "./contexts/uploadService";
import { ChakraProvider } from "@chakra-ui/react";
import rpcClient from "./lib/rpc";

const Space = React.lazy(() => import("./pages/Space"));
const Landing = React.lazy(() => import("./pages/Landing"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

ReactGA.initialize("UA-159864166-1", { debug: ENVIRONMENT === "development" });

axios.defaults.headers.common["api-key"] = "secretcat";

const useStyles = makeStyles(() => ({
  root: {
    maxWidth: "100%",
    minHeight: "100vh",
    overflowX: "hidden",
  },
  success: {
    backgroundColor: Colors.SUCCESS,
  },
  error: {
    backgroundColor: Colors.DANGER,
  },
  warning: {
    backgroundColor: Colors.WARNING,
  },
  info: {
    backgroundColor: Colors.DARK_ACCENT,
  },
}));

const history = createBrowserHistory();

history.listen((location) => {
  if (location.pathname && location.pathname.includes("/s")) {
    ReactGA.pageview("/s/XXXXXX");
  } else {
    ReactGA.pageview(location.pathname);
  }
});

const App: React.FC<{}> = () => {
  const classes = useStyles();
  const windowWidth = useWindowWidth();
  const [loading, setLoading] = useState<boolean>(true);
  const queryClient = new QueryClient();

  useEffect(() => {
    const func = async () => {
      const lastVisit = localStorage.getItem(LAST_VISIT_STORAGE_KEY);
      const threeHoursAgo = new Date();
      threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
      const username = localStorage.getItem(USERNAME_STORAGE_KEY);
      if (
        !username ||
        !lastVisit ||
        new Date(lastVisit) < new Date(threeHoursAgo)
      ) {
        // Generate new username
        const { username: newUsername } = await rpcClient.invoke(
          "generateUsername"
        );
        localStorage.setItem(USERNAME_STORAGE_KEY, newUsername);
      }
      setLoading(false);
    };
    func();
  }, []);

  if (loading) {
    // FIXME: This component overflows...
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: Colors.LIGHT_SHADE,
        }}
      />
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider
          maxSnack={3}
          classes={{
            variantSuccess: classes.success,
            variantError: classes.error,
            variantWarning: classes.warning,
            variantInfo: classes.info,
          }}
          anchorOrigin={{
            vertical: windowWidth > Breakpoints.MD ? "bottom" : "top",
            horizontal: windowWidth > Breakpoints.MD ? "right" : "center",
          }}
        >
          <UploadServiceProvider>
            <SelectedFilesProvider>
              <Router history={history}>
                <Suspense fallback={null}>
                  <Switch>
                    <Route exact path="/" component={Landing} />
                    <Route path="/s/:code" component={Space} />
                    <Route component={NotFound} />
                  </Switch>
                </Suspense>
              </Router>
            </SelectedFilesProvider>
          </UploadServiceProvider>
        </SnackbarProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
};

export default App;
