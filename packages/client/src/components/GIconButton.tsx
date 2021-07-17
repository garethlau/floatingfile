import React, { useState } from "react";
import IconButton, { IconButtonProps } from "@material-ui/core/IconButton";
import { Colors, Elevation } from "@floatingfile/common";
import ReactGA, { EventArgs } from "react-ga";

type GIconButtonProps = Omit<IconButtonProps, "variant"> & {
  disableElevation?: boolean;
  inverse?: boolean;
  overrideStyles?: any;
  debounce?: number;
  isLoading?: boolean;
  variant: "primary" | "secondary" | "danger" | "success";
  event?: EventArgs;
};

const GIconButton: React.FC<GIconButtonProps> = ({
  children,
  variant,
  inverse,
  disableElevation,
  debounce = 1,
  onClick,
  event,
  ...others
}) => {
  const style: any = {
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
    const tmp = style.backgroundColor;
    style.backgroundColor = style.color;
    style.color = tmp;
  }

  if (others.disabled) {
    style.opacity = 0.7;
  }

  const [debouncing, setDebouncing] = useState(false);

  function debouncedOnClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (debouncing) return;
    setDebouncing(true);
    setTimeout(() => setDebouncing(false), debounce * 1000);
    if (event) {
      // Track button click event
      ReactGA.event(event);
    }
    if (onClick) onClick(e);
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
};

export default GIconButton;
