import React, { useRef, useState, useEffect, Suspense } from "react";
import {
  useHistory,
  useParams,
  Switch,
  Route,
  RouteComponentProps,
} from "react-router-dom";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import {
  BASE_API_URL,
  USERNAME_STORAGE_KEY,
  LAST_VISIT_STORAGE_KEY,
} from "../env";
import { Colors, SpaceEvents } from "@floatingfile/common";
import Button from "../components/Button";
import IntroToast from "../components/intro-toast";
import UploadQueue from "../components/upload-queue";
import useSpace from "../queries/useSpace";
import useWindowWidth from "../hooks/useWindowWidth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import FullPageLoader from "../components/FullPageLoader";
import SpaceNotFound from "../components/SpaceNotFound";
import FilesPanel from "../components/FilesPanel";
import NavBar from "../components/nav-bar";
import FadeIn from "../components/animations/FadeIn";
import {
  Box,
  useToast,
  Alert,
  Flex,
  AlertTitle,
  AlertDescription,
  chakra,
  HStack,
  Stack,
} from "@chakra-ui/react";

const SettingsPanel = React.lazy(() => import("../components/SettingsPanel"));
const ConnectPanel = React.lazy(() => import("../components/connect-panel"));
const HistoryPanel = React.lazy(() => import("../components/history-panel"));
const UsersPanel = React.lazy(() => import("../components/users-panel"));

const useStyles = makeStyles((theme) => ({
  rootLarge: {
    width: "100vw",
    height: "100vh",
    display: "grid",
    gridTemplateAreas: "'nav panel main'",
    gridTemplateRows: "100vh",
    gridTemplateColumns: "80px 240px auto",
  },
  rootMedium: {
    width: "100vw",
    height: "100vh",
    display: "grid",
    gridTemplateAreas: "'main' 'nav'",
    gridTemplateRows: "calc(100vh - 64px) 64px",
    gridTemplateColumns: "auto",
  },
  rootSmall: {
    width: "100vw",
    height: "100vh",
    display: "grid",
    gridTemplateAreas: "'nav' 'main'",
    gridTemplateRows: "64px auto",
    gridTemplateColumns: "1fr",
  },
  navContainer: {
    gridArea: "nav",
    zIndex: 2,
  },
  panelContainer: {
    gridArea: "panel",
    backgroundColor: Colors.WHITE,
    height: "100%",
    zIndex: 3,
  },
  mainContainer: {
    gridArea: "main",
    zIndex: 3,
  },
}));

const panelFallback = null;

const SMLayout: React.FC<SpaceProps> = ({ match, clientId }) => {
  const classes = useStyles();
  return (
    <div className={classes.rootSmall}>
      <div className={classes.navContainer}>
        <NavBar baseUrl={match.url} orientation="horizontal" />
      </div>
      <div className={classes.mainContainer}>
        <Suspense fallback={panelFallback}>
          <Switch>
            <Route path={`${match.path}/settings`}>
              <SettingsPanel />
            </Route>
            <Route path={`${match.path}/history`} component={HistoryPanel} />
            <Route path={`${match.path}/users`}>
              <UsersPanel myClientId={clientId} />
            </Route>
            <Route path={`${match.path}/files`} component={FilesPanel} />
            <Route path={`${match.path}`} component={ConnectPanel} />
          </Switch>
        </Suspense>
      </div>
    </div>
  );
};

const MDLayout: React.FC<SpaceProps> = ({ match, clientId }) => {
  const classes = useStyles();
  return (
    <div className={classes.rootMedium}>
      <div className={classes.mainContainer}>
        <Suspense fallback={panelFallback}>
          <Switch>
            <Route path={`${match.path}/settings`}>
              <FadeIn>
                <SettingsPanel />
              </FadeIn>
            </Route>
            <Route path={`${match.path}/history`}>
              <FadeIn>
                <HistoryPanel />
              </FadeIn>
            </Route>

            <Route path={`${match.path}/users`}>
              <FadeIn>
                <UsersPanel myClientId={clientId} />
              </FadeIn>
            </Route>
            <Route path={`${match.path}/files`} component={FilesPanel} />
            <Route path={`${match.path}`}>
              <FadeIn>
                <ConnectPanel />
              </FadeIn>
            </Route>
          </Switch>
        </Suspense>
      </div>
      <div className={classes.navContainer}>
        <NavBar baseUrl={match.url} orientation="horizontal" />
      </div>
    </div>
  );
};

const LGLayout: React.FC<SpaceProps> = ({ match, clientId }) => {
  const classes = useStyles();
  return (
    <div className={classes.rootLarge}>
      <div className={classes.navContainer}>
        <NavBar baseUrl={match.url} orientation="vertical" />
      </div>
      <div className={classes.panelContainer}>
        <Suspense fallback={panelFallback}>
          <Switch>
            <Route path={`${match.path}/settings`}>
              <FadeIn>
                <SettingsPanel />
              </FadeIn>
            </Route>
            <Route path={`${match.path}/history`}>
              <FadeIn>
                <HistoryPanel />
              </FadeIn>
            </Route>

            <Route path={`${match.path}/users`}>
              <FadeIn>
                <UsersPanel myClientId={clientId} />
              </FadeIn>
            </Route>
            <Route path={`${match.path}`}>
              <FadeIn>
                <ConnectPanel />
              </FadeIn>
            </Route>
          </Switch>
        </Suspense>
      </div>
      <div className={classes.mainContainer}>
        <FilesPanel />
      </div>
    </div>
  );
};

interface MatchParams {
  code: string;
}

interface SpaceProps extends RouteComponentProps<MatchParams> {
  clientId: string;
}

const Space: React.FC<SpaceProps> = (props) => {
  const windowWidth = useWindowWidth();
  const history = useHistory();
  const { code }: { code: string } = useParams();

  useDocumentTitle(`floatingfile | ${code}`);

  const { status: spaceStatus, refetch: refetchSpace } = useSpace(code);

  const toast = useToast();
  const introToastRef = useRef<string | number | undefined | null>(null);

  const [myClientId, setMyClientId] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [exists, setExists] = useState<boolean>(false);

  useEffect(() => {
    if (spaceStatus === "error") {
      toast({
        position: "bottom-right",
        title: "There was an error loading thet space.",
        description: "Please reload the page.",
        isClosable: true,
        render: () => (
          <Alert status="error" variant="solid" borderRadius="md">
            <Box>
              <AlertTitle>There was an error loading the space.</AlertTitle>
              <AlertDescription>Please reload the page.</AlertDescription>
            </Box>
            <Button
              colorScheme="white"
              onClick={() => window.location.reload()}
            >
              Reload
            </Button>
          </Alert>
        ),
      });
    }
  }, [spaceStatus]);

  useEffect(() => {
    // Show intro modal
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const lastVisit = localStorage.getItem(LAST_VISIT_STORAGE_KEY || "");
    if (!lastVisit || new Date(lastVisit) < new Date(weekAgo)) {
      introToastRef.current = toast({
        position: "top-right",
        render: () => (
          <IntroToast
            handleClose={() => {
              if (introToastRef.current) {
                toast.close(introToastRef.current);
              }
            }}
          />
        ),
      });
    }

    // Set last visit date
    localStorage.setItem(LAST_VISIT_STORAGE_KEY, new Date().toString());
  }, []);

  useEffect(() => {
    const username = localStorage.getItem(USERNAME_STORAGE_KEY);
    const eventSource = new EventSource(
      `${BASE_API_URL}/api/v5/subscriptions/${code}?username=${username}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { type, clientId } = data;
      switch (type) {
        case SpaceEvents.CONNECTION_ESTABLISHED:
          setMyClientId(clientId);
          refetchSpace();
          break;
        case SpaceEvents.FILES_UPDATED:
        case SpaceEvents.HISTORY_UPDATED:
        case SpaceEvents.USERS_UPDATED:
          refetchSpace();
          break;
        case SpaceEvents.SPACE_DELETED:
          toast({
            title: "This space has been destroyed.",
            description: "Redirecting you to the home page.",
            status: "info",
            isClosable: true,
            position: "bottom-right",
          });

          setTimeout(() => {
            history.push("/");
          }, 3000);
          break;
        default:
      }
    };
    return () => {
      eventSource.close();
    };
  }, [code]);

  useEffect(() => {
    if (code) {
      axios
        .get(`${BASE_API_URL}/api/v5/spaces/${code}`)
        .then(() => {
          setExists(true);
        })
        .catch((err) => {
          if (err.response?.status === 404) {
            // Space not found
            setExists(false);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  if (isLoading) {
    return <FullPageLoader />;
  }
  if (!exists) {
    return <SpaceNotFound />;
  }
  return (
    <>
      <UploadQueue />
      {windowWidth > 960 ? (
        <LGLayout {...props} clientId={myClientId} />
      ) : windowWidth > 640 ? (
        <MDLayout {...props} clientId={myClientId} />
      ) : (
        <SMLayout {...props} clientId={myClientId} />
      )}
    </>
  );
};
export default Space;
