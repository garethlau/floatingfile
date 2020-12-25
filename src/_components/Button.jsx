import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import { Colors, Elevation } from "../constants";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme) => ({
	loader: {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		height: "24px",
	},
}));
const StyledCircularProgress = withStyles((theme) => ({
	root: {
		color: "white",
	},
}))(CircularProgress);

export default function CustomButton({
	children,
	variant,
	disableElevation,
	inverse,
	overrideStyles,
	onClick,
	debounce = 3,
	isLoading,
	...others
}) {
	const cls = useStyles();
	const style = {
		fontFamily: "DM Sans",
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
		if (onClick) onClick(e);
	}

	return (
		<Button
			style={{
				boxShadow: disableElevation || others.disabled ? "" : Elevation.TWO,
				...style,
				...overrideStyles,
				whiteSpace: "nowrap",
			}}
			onClick={debouncedOnClick}
			{...others}
		>
			<span style={{ opacity: isLoading ? 0 : 1 }}>{children}</span>
			<span className={cls.loader}>{isLoading && <StyledCircularProgress size={24} />}</span>
		</Button>
	);
}
