import React, { useState } from "react";
import {
  Button as ChakraButton,
  ButtonProps as ChakraButtonProps,
  forwardRef,
} from "@chakra-ui/react";

export type ButtonProps = ChakraButtonProps & {
  throttle?: number;
};

const Button = forwardRef<ButtonProps, "button">(
  ({ colorScheme, children, onClick, throttle = 1, ...rest }, ref) => {
    const [throttling, setThrottling] = useState(false);

    function throttledOnClick(e: React.MouseEvent<HTMLButtonElement>) {
      if (throttling) return;
      setThrottling(true);
      setTimeout(() => setThrottling(false), throttle * 1000);
      if (typeof onClick === "function") onClick(e);
    }

    if (colorScheme === "white") {
      return (
        <ChakraButton
          ref={ref}
          bg="white"
          color="black"
          _hover={{
            backgroundColor: "gray.200",
          }}
          onClick={throttledOnClick}
          {...rest}
        >
          {children}
        </ChakraButton>
      );
    }
    if (colorScheme === "black") {
      return (
        <ChakraButton
          ref={ref}
          bg="black"
          color="white"
          _hover={{
            backgroundColor: "gray.800",
          }}
          onClick={throttledOnClick}
          {...rest}
        >
          {children}
        </ChakraButton>
      );
    }
    return (
      <ChakraButton
        ref={ref}
        colorScheme={colorScheme}
        onClick={throttledOnClick}
        {...rest}
      >
        {children}
      </ChakraButton>
    );
  }
);

export default Button;
