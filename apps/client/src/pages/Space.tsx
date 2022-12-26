import React, { useRef, useState, useEffect, Suspense } from "react";
import {
  useHistory,
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
import { NotificationTypes } from "@floatingfile/types";
import {
  USERNAME_STORAGE_KEY,
  LAST_VISIT_STORAGE_KEY,
  EVENT_SOURCE,
} from "../env";
import Button from "../components/Button";
import IntroToast from "../components/IntroToast";
import UploadQueue from "../components/UploadQueue";
import { useSpace } from "../contexts/space";
import useDocumentTitle from "../hooks/useDocumentTitle";
import FullPageLoader from "../components/FullPageLoader";
import SpaceNotFound from "../components/SpaceNotFound";
import FilesPanel from "../components/FilesPanel";
import NavBar from "../components/NavBar";
import FadeIn from "../components/animations/FadeIn";
import useLayout, { Layouts } from "../hooks/useLayout";

const ConnectPanel = React.lazy(() => import("../components/ConnectPanel"));
const HistoryPanel = React.lazy(() => import("../components/HistoryPanel"));
const UsersPanel = React.lazy(() => import("../components/UsersPanel"));
const panelFallback = null;

const SMLayout: React.FC<SpaceProps> = ({ match, clientId }) => (
  <Flex w="100vw" h="100vh" direction="column">
    <Box h="64px">
      <NavBar orientation="horizontal" baseUrl={match.url} />
    </Box>
    <Box flex={1}>
      <Suspense fallback={panelFallback}>
        <Switch>
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

const Space: React.FC<RouteComponentProps<MatchParams>> = (props) => {
  const history = useHistory();
  const layout = useLayout();
  const {
    code,
    status: spaceStatus,
    space,
    refetch: refetchSpace,
  } = useSpace();

  useDocumentTitle(`floatingfile | ${code}`);

  const toast = useToast();
  const introToastRef = useRef<string | number | undefined | null>(null);

  const [myClientId, setMyClientId] = useState<string>("");

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
    const lastVisit = localStorage.getItem(LAST_VISIT_STORAGE_KEY);
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
    let timer: ReturnType<typeof setTimeout>;
    const username = localStorage.getItem(USERNAME_STORAGE_KEY);

    const url = `${EVENT_SOURCE}/${code}?username=${username}`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { type, clientId } = data;
      switch (type) {
        case NotificationTypes.CONNECTION_ESTABLISHED:
          setMyClientId(clientId);
          refetchSpace();
          break;

        case NotificationTypes.SPACE_UPDATED:
          refetchSpace();
          break;
        case NotificationTypes.SPACE_DESTROYED:
          toast({
            title: "This space has been destroyed.",
            description: "Redirecting you to the home page.",
            status: "info",
            isClosable: true,
            position: "bottom-right",
          });

          timer = setTimeout(() => {
            history.push("/");
          }, 3000);
          break;
        default:
      }
    };
    return () => {
      clearTimeout(timer);
      eventSource.close();
      toast.closeAll();
    };
  }, [code]);

  if (spaceStatus === "loading" || spaceStatus === "idle") {
    return <FullPageLoader />;
  }
  if (spaceStatus === "error" || !space) {
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
