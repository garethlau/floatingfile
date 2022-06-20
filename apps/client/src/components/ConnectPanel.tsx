import React, { useState, useEffect } from "react";
import QRCode from "qrcode.react";
import { ORIGIN } from "../env";
import { CopyToClipboard } from "react-copy-to-clipboard";
import useSpace from "../hooks/useSpace";
import { useParams, useHistory } from "react-router-dom";
import floatingfileImg from "../assets/images/floatingfile.png";
import { Flex, Spacer, Box, chakra, Button, useToast } from "@chakra-ui/react";
import Panel from "./Panel";
import Honeybadger from "../lib/honeybadger";
import add from "date-fns/add";
import logger from "../lib/logger";

const THIRTY_MINUTES: number = 30 * 60 * 1000;
const FIVE_MINUTES: number = 5 * 60 * 1000;

const ConnectPanel: React.FC = () => {
  const { code }: { code: string } = useParams();
  const { space, destroy } = useSpace(code);
  const history = useHistory();
  const [isDestroying, setIsDestroying] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0); // In seconds
  const toast = useToast();

  const close = async () => {
    try {
      setIsDestroying(true);
      await destroy();
      logger.info("Successfully destroyed space", { code });
      history.push("/");
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Failed to destroy space", { code, error });
        Honeybadger.notify(error);
      }
    } finally {
      setIsDestroying(false);
    }
  };

  useEffect(() => {
    if (!space) return undefined;
    const timers: any = {};
    const createdAt = new Date(space.createdAt);
    const expiryDate = add(createdAt, { hours: 12 });
    const currDate = new Date();
    const duration = expiryDate.getTime() - currDate.getTime();
    if (duration < 0) {
      // This space has already expired
      toast({
        title: "This space has expired.",
        status: "error",
        isClosable: true,
      });
    }
    if (duration - FIVE_MINUTES > 0) {
      // Set five minute timeout warning
      timers.five = setTimeout(() => {
        toast({
          title: "Space will expire in 5 minutes.",
          status: "warning",
          isClosable: true,
        });
      }, duration - FIVE_MINUTES);
    }

    if (duration - THIRTY_MINUTES > 0) {
      // Set thirty minute timeout warning
      timers.thirty = setTimeout(() => {
        toast({
          title: "Space will expire in 30 minutes.",
          status: "warning",
          isClosable: true,
        });
      }, duration - THIRTY_MINUTES);
    }

    if (duration > 0) {
      timers.zero = setTimeout(() => {
        toast({
          title: "Space has expired.",
          description: "You will be redirected to the home page.",
          status: "error",
        });
        setTimeout(() => {
          history.push("/");
        }, 5000);
      }, duration);
    }

    setTimeLeft(duration / 1000);
    return () => {
      // Clear timeouts
      Object.keys(timers).forEach((timerName) => {
        clearTimeout(timers[timerName]);
      });
    };
  }, [space]);

  useEffect(() => {
    const intervalId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(intervalId);
  }, [setTimeLeft]);

  return (
    <Panel title="Connect">
      <Flex direction="column" align="center" h="100%">
        <Spacer />
        <chakra.p opacity={0.5} textAlign="center">
          Join this space:
        </chakra.p>
        <CopyToClipboard
          text={`${ORIGIN}/s/${code}`}
          onCopy={() => {
            toast({
              title: "URL copied to clipboard.",
              status: "success",
              isClosable: true,
            });
          }}
        >
          <chakra.div
            w="200px"
            m="10px auto"
            borderRadius="md"
            bg="lightAccent"
            _hover={{ cursor: "pointer" }}
          >
            <chakra.p
              fontSize="32px"
              fontWeight="bold"
              color="white"
              textAlign="center"
            >
              {code || ""}
            </chakra.p>
          </chakra.div>
        </CopyToClipboard>
        <Flex justify="center">
          <QRCode
            value={`${ORIGIN}/s/${code}`}
            size={200}
            bgColor="#ffffff"
            fgColor="#000000"
            level="L"
            includeMargin={false}
            renderAs="svg"
            imageSettings={{
              src: floatingfileImg,
              height: 24,
              width: 24,
              excavate: true,
            }}
          />
        </Flex>
        <Spacer />
        <Box textAlign="center">
          <chakra.p opacity={0.5}>Space will be destroyed in:</chakra.p>
          <chakra.p
            fontWeight="bold"
            fontFamily="monospace"
            fontSize="24px"
            margin="10px"
          >
            {new Date(timeLeft * 1000).toISOString().substr(11, 8)}
          </chakra.p>
          <Button
            colorScheme="red"
            onClick={close}
            isLoading={isDestroying}
            debounce={5}
          >
            Destroy Now
          </Button>
        </Box>
      </Flex>
    </Panel>
  );
};

export default ConnectPanel;
