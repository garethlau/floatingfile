import React, { useEffect, useState, Suspense } from "react";
import { makeStyles } from "@material-ui/core";
import { Router, Switch, Route } from "react-router-dom";
import { createBrowserHistory } from "history";
import { SnackbarProvider } from "notistack";
import { Breakpoints } from "./constants";
import { Colors } from "@floatingfile/common";
import {
  USERNAME_STORAGE_KEY,
  BASE_API_URL,
  ENVIRONMENT,
  LAST_VISIT_STORAGE_KEY,
} from "./env";
import useWindowWidth from "./_hooks/useWindowWidth";
import axios from "axios";
import ReactGA from "react-ga";
import { QueryClient, QueryClientProvider } from "react-query";
import { SelectedFilesProvider } from "./_contexts/selectedFiles";
import { UploadServiceProvider } from "./_contexts/uploadService";
import SpaceValidator from "./_wrappers/SpaceValidator";

const Space = React.lazy(() => import("./_pages/Space"));
const Landing = React.lazy(() => import("./_pages/Landing"));
const NotFound = React.lazy(() => import("./_pages/NotFound"));

ReactGA.initialize("UA-159864166-1", { debug: ENVIRONMENT === "development" });

axios.defaults.headers.common["api-key"] = "secretcat";

const useStyles = makeStyles((theme) => ({
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
    const lastVisit = localStorage.getItem(LAST_VISIT_STORAGE_KEY);
    let threeHoursAgo = new Date();
    threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
    let username = localStorage.getItem(USERNAME_STORAGE_KEY);
    if (
      !username ||
      !lastVisit ||
      new Date(lastVisit) < new Date(threeHoursAgo)
    ) {
      // Generate new username
      axios.get(`${BASE_API_URL}/api/v4/nickname`).then((res) => {
        localStorage.setItem(USERNAME_STORAGE_KEY, res.data.username);
        axios.defaults.headers.common["username"] = res.data.username;
        setLoading(false);
      });
    } else {
      // Use previous username
      axios.defaults.headers.common["username"] = username;
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: Colors.LIGHT_SHADE,
        }}
      ></div>
    );
  } else {
    return (
      <div className={classes.root}>
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
                <header className="App-header">
                  <Router history={history}>
                    <Suspense fallback={null}>
                      <Switch>
                        <Route exact path="/" component={Landing} />
                        <Route path="/s/:code">
                          <SpaceValidator>
                            <Space />
                          </SpaceValidator>
                        </Route>
                        <Route component={NotFound} />
                      </Switch>
                    </Suspense>
                  </Router>
                </header>
              </SelectedFilesProvider>
            </UploadServiceProvider>
          </SnackbarProvider>
        </QueryClientProvider>
      </div>
    );
  }
};

export default App;
