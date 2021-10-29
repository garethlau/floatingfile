import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

export default function FadeIn({ children }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "-100px 0px",
  });
  return (
    <motion.div
      ref={ref}
      variants={{
        initial: { opacity: 0, y: 50 },
        enter: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.333,
            ease: "easeOut",
            staggerChildren: 0.1,
          },
        },
        exit: {
          opacity: 0,
          y: -30,
          transition: {
            duration: 0.333,
            ease: "easeOut",
            staggerChildren: 0.1,
          },
        },
      }}
      initial="initial"
      animate={inView ? "enter" : "initial"}
    >
      {children}
    </motion.div>
  );
}
