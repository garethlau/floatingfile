import React from "react";
import { Colors } from "@floatingfile/common";
import {
  mdiUpload,
  mdiDownload,
  mdiDelete,
  mdiTimerSandEmpty,
  mdiAccountPlus,
  mdiAccountMinus,
} from "@mdi/js";
import Icon from "@mdi/react";
import { useParams } from "react-router-dom";
import { Stack, Box, Flex, chakra } from "@chakra-ui/react";
import useSpace from "../queries/useSpace";
import Panel from "./panel";

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
    default:
      return "";
  }
}

const HistoryPanel: React.FC = () => {
  const { code }: { code: string } = useParams();
  const { data: space } = useSpace(code);
  const history = space?.history || [];

  return (
    <Panel title="History">
      {history.length > 0 ? (
        <Stack spacing={2}>
          {history
            .sort((a, b) => {
              return (
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
              );
            })
            .map(({ payload, author, action, timestamp }, index) => (
              <Flex
                key={timestamp}
                bg={Colors.LIGHT_SHADE}
                borderRadius="md"
                shadow="base"
                align="center"
                h="52px"
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
                  <chakra.p
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {payload}
                  </chakra.p>
                  {author && <chakra.p opacity={0.7}>{author}</chakra.p>}
                </Box>
              </Flex>
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
