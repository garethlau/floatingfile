import React from "react";
import { chakra } from "@chakra-ui/react";
import Page from "components/Page";

const Custom404: React.FC = () => {
  return (
    <Page>
      <chakra.p pt="80px" fontWeight="bold">
        404
      </chakra.p>
      <chakra.p fontSize="4rem" fontWeight="bold">
        Sorry, the page you were looking was not found
      </chakra.p>
    </Page>
  );
};
export default Custom404;
