import React, { useState } from "react";
import { USERNAME_STORAGE_KEY } from "../env";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Colors, Elevation } from "@floatingfile/common";
import FaceIcon from "@material-ui/icons/Face";
import Center from "./Center";
import useSpace from "../queries/useSpace";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "grid",
    gridTemplateRows: "64px calc(100vh - 128px)",
    height: "100%",
    width: "100%",
    backgroundColor: Colors.WHITE,
    [theme.breakpoints.up("md")]: {
      gridTemplateRows: "64px calc(100vh - 64px)",
    },
  },
  title: {
    color: Colors.LIGHT_ACCENT,
    textAlign: "center",
    [theme.breakpoints.up("sm")]: {
      textAlign: "left",
      marginLeft: "20px",
    },
  },
  tileContainer: {
    [theme.breakpoints.up("md")]: {
      overflowY: "auto",
    },
  },
  tile: {
    display: "grid",
    gridTemplateColumns: "48px 168px",
    backgroundColor: Colors.LIGHT_SHADE,
    borderRadius: "5px",
    height: "52px",
    padding: "5px",
    margin: "10px",
    boxShadow: Elevation.ONE,
    [theme.breakpoints.up("md")]: {
      margin: "5px",
      boxShadow: "none",
    },
  },
}));

interface UsersPanelProps {
  myClientId?: string;
}

const UsersPanel: React.FC<UsersPanelProps> = ({ myClientId }) => {
  const { code }: { code: string } = useParams();
  const { data: space } = useSpace(code);
  const users = space?.users || [];

  const cls = useStyles();

  return (
    <div className={cls.root}>
      <h2 className={cls.title}>Users</h2>
      <div className={cls.tileContainer}>
        {users.map(({ username, id }, index) => {
          return (
            <div className={cls.tile} key={index}>
              <div>
                <Center>
                  <FaceIcon
                    style={{ color: username?.split("-")[0], fontSize: 36 }}
                  />
                </Center>
              </div>

              {myClientId === id ? (
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {username}
                  </p>

                  <p
                    style={{
                      margin: 0,
                      opacity: 0.7,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    (me)
                  </p>
                </div>
              ) : (
                <div>
                  <p
                    style={{
                      marginTop: "10px",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {username}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UsersPanel as React.FC<UsersPanelProps>;
