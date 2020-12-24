import React from "react";
import { Colors } from "../constants";
import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";

export default function UploadProgress({ loaded, total, textColor, ringColor, noText }) {
	return (
		<Box position="relative" display="inline-flex">
			<CircularProgress
				variant="static"
				value={(loaded / total) * 100}
				style={{ color: ringColor || Colors.SUCCESS }}
				size={noText ? "32px" : "42px"}
			/>
			{!noText && (
				<Box
					top={0}
					left={0}
					bottom={0}
					right={0}
					position="absolute"
					display="flex"
					alignItems="center"
					justifyContent="center"
				>
					<p style={{ color: textColor || "black" }}>{((loaded / total) * 100).toFixed(0)}%</p>
				</Box>
			)}
		</Box>
	);
}
