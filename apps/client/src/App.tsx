import React, { useEffect, useState, Suspense } from "react";
import { Router, Switch, Route } from "react-router-dom";
import { createBrowserHistory } from "history";
import { theme } from "@floatingfile/ui";
import axios from "axios";
import ReactGA from "react-ga";
import { QueryClient, QueryClientProvider } from "react-query";
import { ChakraProvider } from "@chakra-ui/react";
import {
  USERNAME_STORAGE_KEY,
  ENVIRONMENT,
  LAST_VISIT_STORAGE_KEY,
} from "./env";
import { UploadServiceProvider } from "./contexts/uploadService";
import { SpaceProvider } from "./contexts/space";
import rpcClient from "./lib/rpc";

const Space = React.lazy(() => import("./pages/Space"));
const Landing = React.lazy(() => import("./pages/Landing"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Tunnel = React.lazy(() => import("./pages/Tunnel"));
const CreateTunnel = React.lazy(() => import("./pages/CreateTunnel"));

ReactGA.initialize("UA-159864166-1", { debug: ENVIRONMENT === "development" });

axios.defaults.headers.common["api-key"] = "secretcat";

const history = createBrowserHistory();

history.listen((location) => {
  if (location.pathname && location.pathname.includes("/s")) {
    ReactGA.pageview("/s/XXXXXX");
  } else {
    ReactGA.pageview(location.pathname);
  }
});

const App: React.FC<{}> = () => {
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

  if (loading) return null;

  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <Suspense fallback={null}>
            <Switch>
              <Route exact path="/" component={Landing} />
              <Route
                path="/s/:code"
                render={(routeProps) => (
                  <SpaceProvider>
                    <UploadServiceProvider>
                      <Space {...routeProps} />
                    </UploadServiceProvider>
                  </SpaceProvider>
                )}
              />
              <Route path="/tunnel" component={CreateTunnel} />
              <Route path="/t/:code" component={Tunnel} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </Router>
      </QueryClientProvider>
    </ChakraProvider>
  );
};

export default App;
