import React from "react";
import { motion } from "framer-motion";

const FadeIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      style={{ height: "100%", width: "100%" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
