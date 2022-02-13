import React from "react";
import { Box, BoxProps } from "@chakra-ui/react";

export type VideoProps = {
  src: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  borderRadius;
} & BoxProps;

const Video: React.FC<VideoProps> = ({
  src,
  autoPlay,
  loop,
  muted,
  borderRadius,
  ...rest
}) => {
  return (
    <Box {...rest}>
      <video
        src={src}
        style={{ borderRadius: `var(--chakra-radii-${borderRadius})` }}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
      />
    </Box>
  );
};

export default Video;
