import React, { useState, useEffect, Suspense } from "react";
import {
  useHistory,
  useParams,
  Switch,
  Route,
  RouteComponentProps,
} from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
import { makeStyles } from "@material-ui/core/styles";
import {
  BASE_API_URL,
  USERNAME_STORAGE_KEY,
  LAST_VISIT_STORAGE_KEY,
} from "../env";
import { Colors, SpaceEvents } from "@floatingfile/common";
import Button from "../components/Button";
import IntroToast from "../components/IntroToast";
import UploadQueue from "../components/UploadQueue";
import useSpace from "../queries/useSpace";
import useWindowWidth from "../hooks/useWindowWidth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import FullPageLoader from "../components/FullPageLoader";
import SpaceNotFound from "../components/SpaceNotFound";
import FilesPanel from "../components/FilesPanel";
import NavBar from "../components/NavBar";
import FadeIn from "../components/animations/FadeIn";

const SettingsPanel = React.lazy(() => import("../components/SettingsPanel"));
const ConnectPanel = React.lazy(() => import("../components/ConnectPanel"));
const HistoryPanel = React.lazy(() => import("../components/HistoryPanel"));
const UsersPanel = React.lazy(() => import("../components/UsersPanel"));

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
  },
  panelContainer: {
    gridArea: "panel",
    backgroundColor: Colors.WHITE,
    height: "100%",
  },
  mainContainer: {
    gridArea: "main",
    zIndex: 10,
  },
}));

const panelFallback = null;

const SMLayout: React.FC<SpaceProps> = ({ match, clientId }) => {
  const classes = useStyles();
  return (
    <div className={classes.rootSmall}>
      <div className={classes.navContainer}>
        <NavBar size="small" baseUrl={match.url} />
      </div>
      <div className={classes.mainContainer}>
        <Suspense fallback={panelFallback}>
          <Switch>
            <Route path={`${match.path}/settings`}>
              <SettingsPanel />
            </Route>
            <Route path={`${match.path}/history`}>
              <HistoryPanel />
            </Route>

            <Route path={`${match.path}/users`}>
              <UsersPanel myClientId={clientId} />
            </Route>
            <Route path={`${match.path}/files`} component={FilesPanel} />
            <Route path={`${match.path}`}>
              <div
                style={{
                  height: "100%",
                }}
              >
                <ConnectPanel />
              </div>
            </Route>
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
              <div
                style={{
                  height: "100%",
                }}
              >
                <FadeIn>
                  <ConnectPanel />
                </FadeIn>
              </div>
            </Route>
          </Switch>
        </Suspense>
      </div>
      <div className={classes.navContainer}>
        <NavBar baseUrl={match.url} size="medium" />
      </div>
    </div>
  );
};

const LGLayout: React.FC<SpaceProps> = ({ match, clientId }) => {
  const classes = useStyles();
  return (
    <div className={classes.rootLarge}>
      <div className={classes.navContainer}>
        <NavBar baseUrl={match.url} size="large" />
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
              <div
                style={{
                  height: "100%",
                }}
              >
                <FadeIn>
                  <ConnectPanel />
                </FadeIn>
              </div>
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

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [myClientId, setMyClientId] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [exists, setExists] = useState<boolean>(false);

  useEffect(() => {
    if (spaceStatus === "error") {
      enqueueSnackbar(
        "There was an error loading the space. Please reload the page.",
        {
          variant: "error",
          action: (
            <Button
              variant="danger"
              inverse
              onClick={() => window.location.reload()}
            >
              Reload
            </Button>
          ),
        }
      );
    }
  }, [spaceStatus]);

  useEffect(() => {
    // Show intro modal
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const lastVisit = localStorage.getItem(LAST_VISIT_STORAGE_KEY || "");
    if (!lastVisit || new Date(lastVisit) < new Date(weekAgo)) {
      const key = enqueueSnackbar(
        <IntroToast handleClose={() => closeSnackbar(key)} />,
        {
          persist: true,
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        }
      );
    }

    // Set last visit date
    localStorage.setItem(LAST_VISIT_STORAGE_KEY, new Date().toString());
  }, []);

  useEffect(() => {
    const username = localStorage.getItem(USERNAME_STORAGE_KEY);
    const eventSource = new EventSource(
      `${BASE_API_URL}/api/v5/subscriptions/${code}?username=${username}`
    );

    eventSource.onerror = (error) => {
      console.log(error);
    };

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
          enqueueSnackbar(
            "This space has been destroyed. Redirecting you to the home page.",
            { variant: "error" }
          );

          setTimeout(() => {
            closeSnackbar();
            history.push("/");
          }, 3000);
          break;
        default:
          console.log(`${event} is not handled`);
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
