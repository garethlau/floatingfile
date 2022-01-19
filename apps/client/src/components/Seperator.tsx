import React from "react";
import { chakra } from "@chakra-ui/react";

const Seperator: React.FC<{ text: string }> = ({ text }) => {
  return (
    <chakra.div
      sx={{
        display: "flex",
        alignItems: "center",
        textAlign: "center",
        color: "gray.500",
        opacity: 0.7,
        fontWeight: "bold",
        "&::before": {
          content: "''",
          flex: 1,
          borderBottom: "2px solid",
          borderColor: "gray.300",
          marginRight: "0.25em",
          opacity: 0.7,
        },
        "&::after": {
          content: "''",
          flex: 1,
          borderBottom: "2px solid",
          borderColor: "gray.300",
          marginLeft: "0.25em",
          opacity: 0.7,
        },
      }}
    >
      {text}
    </chakra.div>
  );
};

export default Seperator;
