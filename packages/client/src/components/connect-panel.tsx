import React, { useState, useEffect } from "react";
import { Colors } from "@floatingfile/common";
import QRCode from "qrcode.react";
import MoonLoader from "react-spinners/MoonLoader";
import { ORIGIN } from "../env";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useSnackbar } from "notistack";
import useSpace from "../queries/useSpace";
import { useParams, useHistory } from "react-router-dom";
import useDeleteSpace from "../mutations/useDeleteSpace";
import floatingfileImg from "../assets/images/floatingfile.png";
import { Flex, Spacer, Box, chakra, Button } from "@chakra-ui/react";
import Panel from "./panel";

const THIRTY_MINUTES: number = 30 * 60 * 1000;
const FIVE_MINUTES: number = 5 * 60 * 1000;

const ConnectPanel: React.FC = () => {
  const { code }: { code: string } = useParams();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { data: space } = useSpace(code);
  const history = useHistory();
  const { mutateAsync: deleteSpace, isLoading } = useDeleteSpace(code);
  const [timeLeft, setTimeLeft] = useState<number>(0); // In seconds

  async function close() {
    try {
      await deleteSpace();
      history.push("/");
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const timers: any = {};
    if (space) {
      const expiryDate = new Date(parseInt(space.expires, 10));
      const currDate = new Date();
      const duration = expiryDate.getTime() - currDate.getTime();

      if (duration < 0) {
        // This space has already expired
        enqueueSnackbar("This space has expired.", { variant: "error" });
      }

      if (duration - FIVE_MINUTES > 0) {
        // Set five minute timeout warning
        timers.five = setTimeout(() => {
          enqueueSnackbar("Space will expire in 5 minutes.", {
            variant: "warning",
          });
          setTimeout(() => closeSnackbar(), 5000);
        }, duration - FIVE_MINUTES);
      }

      if (duration - THIRTY_MINUTES > 0) {
        // Set thirty minute timeout warning
        timers.thirty = setTimeout(() => {
          enqueueSnackbar("Space will expire in 30 minutes.", {
            variant: "warning",
          });
          setTimeout(() => closeSnackbar(), 5000);
        }, duration - THIRTY_MINUTES);
      }

      if (duration > 0) {
        timers.zero = setTimeout(() => {
          enqueueSnackbar("Space has expired. Redirecting...", {
            variant: "warning",
          });
          setTimeout(() => {
            closeSnackbar();
            history.push("/");
          });
        }, duration);
      }

      setTimeLeft(duration / 1000);
    }
    return () => {
      // Clear timeouts
      Object.keys(timers).forEach((timerName) => {
        clearTimeout(timers[timerName]);
      });
    };
  }, [space]);

  useEffect(() => {
    if (!timeLeft) return undefined;
    const intervalId = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft]);

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
            enqueueSnackbar(`URL copied to clipboard.`, {
              variant: "success",
            });
            setTimeout(closeSnackbar, 3000);
          }}
        >
          <chakra.div
            w="200px"
            m="10px auto"
            borderRadius="md"
            bg={Colors.LIGHT_ACCENT}
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
          {timeLeft > 0 ? (
            <chakra.p
              fontWeight="bold"
              fontFamily="monospace"
              fontSize="24px"
              margin="10px"
            >
              {new Date(timeLeft * 1000).toISOString().substr(11, 8)}
            </chakra.p>
          ) : (
            <MoonLoader
              css="margin: auto; padding: 10px"
              loading
              color={Colors.MAIN_BRAND}
              size={32}
            />
          )}
          <Button
            colorScheme="red"
            onClick={close}
            isLoading={isLoading}
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
