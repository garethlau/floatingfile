import React, {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useContext,
} from "react";
import {
  useHistory,
  useParams,
  Switch,
  Route,
  RouteComponentProps,
} from "react-router-dom";
import axios from "axios";
import { isMobile } from "react-device-detect";
import MoonLoader from "react-spinners/MoonLoader";
import { useSnackbar } from "notistack";
import { makeStyles } from "@material-ui/core/styles";
import {
  BASE_API_URL,
  USERNAME_STORAGE_KEY,
  LAST_VISIT_STORAGE_KEY,
} from "../env";
import { Colors } from "@floatingfile/common";
import Button from "../components/Button";
import IntroToast from "../components/IntroToast";
import UploadQueue from "../components/UploadQueue";
import useSpace from "../queries/useSpace";
import useFiles from "../queries/useFiles";
import useUsers from "../queries/useUsers";
import { default as useSpaceHistory } from "../queries/useHistory";
import useWindowWidth from "../hooks/useWindowWidth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import FullPageLoader from "../components/FullPageLoader";
import SpaceNotFound from "../components/SpaceNotFound";
import FilesPanel from "../components/FilesPanel";
import NavBar from "../components/NavBar";

const SettingsPanel = React.lazy(() => import("../components/SettingsPanel"));
const ConnectPanel = React.lazy(() => import("../components/ConnectPanel"));
const HistoryPanel = React.lazy(() => import("../components/HistoryPanel"));
const UsersPanel = React.lazy(() => import("../components/UsersPanel"));

enum Events {
  CONNECTION_ESTABLISHED = "CONNECTION_ESTABLISHED",
  FILES_UPDATED = "FILES_UPDATED",
  HISTORY_UPDATED = "HISTORY_UPDATED",
  USERS_UPDATED = "USERS_UPDATED",
  SPACE_DELETED = "SPACE_DELETED",
}

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
        <Switch>
          <Route path={`${match.path}/settings`}>
            <Suspense fallback={panelFallback}>
              <SettingsPanel />
            </Suspense>
          </Route>
          <Route path={`${match.path}/history`}>
            <Suspense fallback={panelFallback}>
              <HistoryPanel />
            </Suspense>
          </Route>

          <Route path={`${match.path}/users`}>
            <Suspense fallback={panelFallback}>
              <UsersPanel myClientId={clientId} />
            </Suspense>
          </Route>
          <Route path={`${match.path}/files`} component={FilesPanel} />
          <Route path={`${match.path}`}>
            <div
              style={{
                height: "100%",
              }}
            >
              <Suspense fallback={panelFallback}>
                <ConnectPanel />
              </Suspense>
            </div>
          </Route>
        </Switch>
      </div>
    </div>
  );
};

const MDLayout: React.FC<SpaceProps> = ({ match, clientId }) => {
  const classes = useStyles();
  return (
    <div className={classes.rootMedium}>
      <div className={classes.mainContainer}>
        <Switch>
          <Route path={`${match.path}/settings`}>
            <Suspense fallback={panelFallback}>
              <SettingsPanel />
            </Suspense>
          </Route>
          <Route path={`${match.path}/history`}>
            <Suspense fallback={panelFallback}>
              <HistoryPanel />
            </Suspense>
          </Route>

          <Route path={`${match.path}/users`}>
            <Suspense fallback={panelFallback}>
              <UsersPanel myClientId={clientId} />
            </Suspense>
          </Route>
          <Route path={`${match.path}/files`} component={FilesPanel} />
          <Route path={`${match.path}`}>
            <div
              style={{
                height: "100%",
              }}
            >
              <Suspense fallback={panelFallback}>
                <ConnectPanel />
              </Suspense>
            </div>
          </Route>
        </Switch>
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
        <Switch>
          <Route path={`${match.path}/settings`}>
            <Suspense fallback={panelFallback}>
              <SettingsPanel />
            </Suspense>
          </Route>
          <Route path={`${match.path}/history`}>
            <Suspense fallback={panelFallback}>
              <HistoryPanel />
            </Suspense>
          </Route>

          <Route path={`${match.path}/users`}>
            <Suspense fallback={panelFallback}>
              <UsersPanel myClientId={clientId} />
            </Suspense>
          </Route>
          <Route path={`${match.path}`}>
            <div
              style={{
                height: "100%",
              }}
            >
              <Suspense fallback={panelFallback}>
                <ConnectPanel />
              </Suspense>
            </div>
          </Route>
        </Switch>
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

  const { refetch: refetchFiles } = useFiles(code);
  const { refetch: refetchHistory } = useSpaceHistory(code);
  const { refetch: refetchUsers } = useUsers(code);

  const [myClientId, setMyClientId] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [exists, setExists] = useState<boolean>(false);

  useEffect(() => {
    if (spaceStatus === "success") {
    } else if (spaceStatus === "error") {
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
    let weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    let lastVisit = localStorage.getItem(LAST_VISIT_STORAGE_KEY || "");
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
    console.log("Event source username ", username);
    let eventSource = new EventSource(
      `${BASE_API_URL}/api/v5/subscriptions/${code}?username=${username}`
    );

    eventSource.onerror = (error) => {
      console.log(error);
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      const { type, clientId } = data;
      switch (type) {
        case Events.CONNECTION_ESTABLISHED:
          setMyClientId(clientId);
          refetchSpace();
          refetchFiles();
          refetchHistory();
          refetchUsers();
          break;
        case Events.FILES_UPDATED:
          refetchFiles();
          refetchHistory();
          break;
        case Events.HISTORY_UPDATED:
          refetchHistory();
          break;
        case Events.USERS_UPDATED:
          refetchHistory();
          refetchUsers();
          break;
        case Events.SPACE_DELETED:
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
          console.log(event + " is not handled");
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
          if (!err.response) {
            console.log(err);
            return;
          } else if (err.response.status === 404) {
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
  } else if (!exists) {
    return <SpaceNotFound />;
  }
  return (
    <React.Fragment>
      <UploadQueue />
      {windowWidth > 960 ? (
        <LGLayout {...props} clientId={myClientId} />
      ) : windowWidth > 640 ? (
        <MDLayout {...props} clientId={myClientId} />
      ) : (
        <SMLayout {...props} clientId={myClientId} />
      )}
    </React.Fragment>
  );
};
export default Space;
