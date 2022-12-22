import React from "react";
import { CgSmile } from "react-icons/cg";
import { Box, Stack, chakra, Flex, Icon } from "@chakra-ui/react";
import { useSpace } from "../contexts/space";
import Panel from "./Panel";

interface UsersPanelProps {
  myClientId?: string;
}

const UsersPanel: React.FC<UsersPanelProps> = ({ myClientId }) => {
  const { space } = useSpace();
  const clients = space?.clients || [];

  return (
    <Panel title="Users">
      <Stack spacing={3}>
        {clients.map(({ username, id }) => (
          <Flex
            key={username}
            bg="lightShade"
            borderRadius="md"
            shadow="base"
            align="center"
            h="52px"
            p="5px"
          >
            <Box mr="10px">
              <Icon
                as={CgSmile}
                w="36px"
                h="36px"
                color={username?.split("-")[0]}
              />
            </Box>
            <Box>
              <chakra.p
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {username}
              </chakra.p>
              {myClientId === id && <chakra.p opacity={0.7}>(me)</chakra.p>}
            </Box>
          </Flex>
        ))}
      </Stack>
    </Panel>
  );
};

export default UsersPanel;
