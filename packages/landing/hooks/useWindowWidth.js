import { useState, useEffect } from "react";

export default function useWindowWidth() {
  const [width, setWidth] = useState(0);

  const handleResize = () => setWidth(window.innerWidth);
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);
  return width;
}
