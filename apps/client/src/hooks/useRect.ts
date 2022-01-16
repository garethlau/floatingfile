import React, { useCallback, useState, useLayoutEffect } from "react";

type RectResult = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

function getRect<T extends HTMLElement>(element?: T): RectResult {
  let rect: RectResult = {
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
  };
  if (element) rect = element.getBoundingClientRect();
  return rect;
}

export default function useRect<T extends HTMLElement>(
  ref: React.RefObject<T>
): RectResult {
  const [rect, setRect] = useState<RectResult>(
    ref && ref.current ? getRect(ref.current) : getRect()
  );

  const handleResize = useCallback(() => {
    if (!ref.current) return;
    setRect(getRect(ref.current)); // Update client rect
  }, [ref]);

  useLayoutEffect(() => {
    const element = ref.current;
    if (element) {
      handleResize();

      if (typeof ResizeObserver === "function") {
        let resizeObserver = new ResizeObserver(() => handleResize());
        resizeObserver.observe(element);
        return () => {
          if (resizeObserver) {
            resizeObserver.disconnect();
          }
        };
      }

      window.addEventListener("resize", handleResize); // Browser support, remove freely
    }
    return () => window.removeEventListener("resize", handleResize);
  }, [ref.current]);

  return rect;
}
