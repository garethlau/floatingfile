import React, { useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import { Colors, Elevation } from "../constants";

export default function GIconButton(props) {
  const {
    children,
    variant,
    inverse,
    disableElevation,
    debounce,
    onClick,
    ...others
  } = props;

  const style = {
    borderRadius: "5px",
  };
  if (variant.toLowerCase() === "primary") {
    style.backgroundColor = Colors.PRIMARY;
    style.color = Colors.WHITE;
  } else if (variant.toLowerCase() === "secondary") {
    style.backgroundColor = Colors.SECONDARY;
    style.color = Colors.WHITE;
  } else if (variant.toLowerCase() === "danger") {
    style.backgroundColor = Colors.DANGER;
    style.color = Colors.WHITE;
  } else if (variant.toLowerCase() === "success") {
    style.backgroundColor = Colors.SUCCESS;
    style.color = Colors.WHITE;
  }
  if (inverse) {
    let tmp = style.backgroundColor;
    style.backgroundColor = style.color;
    style.color = tmp;
  }

  if (others.disabled) {
    style.opacity = 0.7;
  }

  const [debouncing, setDebouncing] = useState(false);

  function debouncedOnClick(e) {
    if (debouncing) return;
    setDebouncing(true);
    setTimeout(() => setDebouncing(false), debounce * 1000);
    onClick(e);
  }

  return (
    <IconButton
      style={{
        boxShadow: disableElevation || others.disabled ? "" : Elevation.TWO,
        ...style,
      }}
      onClick={debounce ? debouncedOnClick : onClick}
      {...others}
    >
      {children}
    </IconButton>
  );
}
