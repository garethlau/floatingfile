import React from "react";
import Center from "../_components/Center";
import useDocumentTitle from "../_hooks/useDocumentTitle";

const NotFound: React.FC<void> = () => {
  useDocumentTitle("floatingfile");
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Center>
        <p>This page does not exist.</p>
      </Center>
    </div>
  );
};

export default NotFound;
