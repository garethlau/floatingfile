import React, { useRef, useState, useEffect, Suspense } from "react";
import {
  useHistory,
  useParams,
  Switch,
  Route,
  RouteComponentProps,
} from "react-router-dom";
import {
  Box,
  useToast,
  Alert,
  Flex,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import axios from "axios";
import { SpaceEvents } from "@floatingfile/common";
import { USERNAME_STORAGE_KEY, LAST_VISIT_STORAGE_KEY } from "../env";
import Button from "../components/Button";
import IntroToast from "../components/intro-toast";
import UploadQueue from "../components/upload-queue";
import useSpace from "../queries/useSpace";
import useDocumentTitle from "../hooks/useDocumentTitle";
import FullPageLoader from "../components/FullPageLoader";
import SpaceNotFound from "../components/SpaceNotFound";
import FilesPanel from "../components/FilesPanel";
import NavBar from "../components/nav-bar";
import FadeIn from "../components/animations/FadeIn";
import useLayout, { Layouts } from "../hooks/useLayout";

const SettingsPanel = React.lazy(() => import("../components/SettingsPanel"));
const ConnectPanel = React.lazy(() => import("../components/connect-panel"));
const HistoryPanel = React.lazy(() => import("../components/history-panel"));
const UsersPanel = React.lazy(() => import("../components/users-panel"));
const panelFallback = null;

const SMLayout: React.FC<SpaceProps> = ({ match, clientId }) => (
  <Flex w="100vw" h="100vh" direction="column">
    <Box h="64px">
      <NavBar orientation="horizontal" baseUrl={match.url} />
    </Box>
    <Box flex={1}>
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
    </Box>
  </Flex>
);

const MDLayout: React.FC<SpaceProps> = ({ match, clientId }) => (
  <Flex w="100vw" h="100vh" direction="column">
    <Box h="calc(100vh - 64px)">
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
    </Box>
    <Box h="64px">
      <NavBar baseUrl={match.url} orientation="horizontal" />
    </Box>
  </Flex>
);

const LGLayout: React.FC<SpaceProps> = ({ match, clientId }) => (
  <Flex w="100vw" h="100vh">
    <Box w="80px">
      <NavBar baseUrl={match.url} orientation="vertical" />
    </Box>
    <Box w="240px">
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
    </Box>
    <Box flex={1}>
      <FilesPanel />
    </Box>
  </Flex>
);

interface MatchParams {
  code: string;
}

interface SpaceProps extends RouteComponentProps<MatchParams> {
  clientId: string;
}

const Space: React.FC<SpaceProps> = (props) => {
  const history = useHistory();
  const { code }: { code: string } = useParams();
  const layout = useLayout();

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
        title: "There was an error loading the space.",
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
      `/api/v5/subscriptions/${code}?username=${username}`
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
        .get(`/api/v5/spaces/${code}`)
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
      {layout === Layouts.DESKTOP ? (
        <LGLayout {...props} clientId={myClientId} />
      ) : layout === Layouts.TABLET ? (
        <MDLayout {...props} clientId={myClientId} />
      ) : (
        <SMLayout {...props} clientId={myClientId} />
      )}
    </>
  );
};
export default Space;
