import React from "react";
import { Colors } from "@floatingfile/ui";
import {
  mdiUpload,
  mdiDownload,
  mdiDelete,
  mdiTimerSandEmpty,
  mdiAccountPlus,
  mdiAccountMinus,
  mdiDoorOpen,
} from "@mdi/js";
import Icon from "@mdi/react";
import { useParams } from "react-router-dom";
import { Stack, Box, Flex, chakra, Tooltip } from "@chakra-ui/react";
import useSpace from "../hooks/useSpace";
import Panel from "./panel";

function getLabel(args: {
  action: string;
  payload?: string;
  author: string;
  createdAt: string;
}): string {
  const { action, payload, author, createdAt } = args;
  const time = new Date(createdAt).toLocaleTimeString();
  switch (action) {
    case "UPLOAD":
      return `${author} uploaded ${payload} at ${time}`;
    case "DOWNLOAD":
      return `${author} downloaded ${payload} at ${time}`;
    case "REMOVE":
      return `${author} removed ${payload} at ${time}`;
    case "LEAVE":
      return `${author} left at ${time}`;
    case "JOIN":
      return `${author} joined at ${time}`;
    case "CREATE":
      return `${author} created the space at ${time}`;
    default:
      return "";
  }
}

function getIconPath(action: string): string {
  switch (action) {
    case "UPLOAD":
      return mdiUpload;
    case "DOWNLOAD":
      return mdiDownload;
    case "REMOVE":
      return mdiDelete;
    case "LEAVE":
      return mdiAccountMinus;
    case "JOIN":
      return mdiAccountPlus;
    case "EXPIRED":
      return mdiTimerSandEmpty;
    case "CREATE":
      return mdiDoorOpen;
    default:
      return "";
  }
}

const HistoryPanel: React.FC = () => {
  const { code }: { code: string } = useParams();
  const { space } = useSpace(code);
  const events = space?.events || [];
  return (
    <Panel title="History">
      {events.length > 0 ? (
        <Stack spacing={2}>
          {events.map(({ id, payload, author, action, createdAt }) => (
            <Tooltip
              label={getLabel({ action, payload, author, createdAt })}
              placement="bottom"
              hasArrow
              maxW="200px"
            >
              <Flex
                key={id}
                bg={Colors.LIGHT_SHADE}
                borderRadius="md"
                shadow="base"
                align="center"
                h="70px"
                p="5px"
              >
                <Flex align="center" justify="center" w="40px">
                  <Icon
                    color={Colors.PRIMARY}
                    path={getIconPath(action)}
                    size="24px"
                  />
                </Flex>
                <Box w="calc(100% - 40px)">
                  <chakra.p fontSize="xs" color="gray.500" lineHeight="1">
                    {new Date(createdAt).toLocaleTimeString()}
                  </chakra.p>
                  <chakra.p
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    lineHeight="1"
                  >
                    {payload}
                  </chakra.p>
                  {author && (
                    <chakra.p lineHeight="1" color="gray.500">
                      {author}
                    </chakra.p>
                  )}
                </Box>
              </Flex>
            </Tooltip>
          ))}
        </Stack>
      ) : (
        <chakra.p opacity={0.7} textAlign={{ base: "center", md: "left" }}>
          The history log will show up here.
        </chakra.p>
      )}
    </Panel>
  );
};

export default HistoryPanel;
