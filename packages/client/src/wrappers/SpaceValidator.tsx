import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { BASE_API_URL } from "../env";
import axios from "axios";
import { Colors } from "@floatingfile/common";
import Center from "../components/Center";
import FullPageLoader from "../components/FullPageLoader";
import { useParams } from "react-router-dom";

interface SpaceValidatorProps {
  children: React.ReactNode;
}

const useStyles = makeStyles((theme) => ({
  page: {
    width: "100vw",
    height: "100vh",
    backgroundColor: Colors.LIGHT_SHADE,
  },
}));

const SpaceValidator: React.FC<SpaceValidatorProps> = ({ children }) => {
  const cls = useStyles();
  const [loading, setLoading] = useState<boolean>(true);
  const [exists, setExists] = useState<boolean>(false);
  const { code }: { code: string } = useParams();

  useEffect(() => {
    if (code) {
      axios
        .get(`${BASE_API_URL}/api/v4/spaces/${code}`)
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
          setLoading(false);
        });
    }
  }, [code]);

  if (loading) {
    return <FullPageLoader />;
  } else if (exists) {
    return <React.Fragment>{children}</React.Fragment>;
  } else {
    return (
      <div className={cls.page}>
        <Center>
          <p style={{ opacity: 0.5 }}>
            <span
              role="img"
              aria-label="Frowny face emoji"
              aria-labelledby="Frowny face emoji"
            >
              🙁{" "}
            </span>
            Oops!
          </p>
          <p style={{ opacity: 0.5 }}>
            It seems that the space you are trying to access does not exist.{" "}
          </p>
          <p style={{ opacity: 0.5 }}>Please double check the code.</p>
        </Center>
      </div>
    );
  }
};

export default SpaceValidator;
