import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import { Colors, Elevation } from "../constants";

export default function GButton(props) {
	const { text, variant, disableElevation, inverse, overrideStyles, onClick, debounce, ...others } = props;
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
		onClick(e);
	}

	return (
		<Button
			style={{
				boxShadow: disableElevation || others.disabled ? "" : Elevation.TWO,
				...style,
				...overrideStyles,
				whiteSpace: "nowrap",
			}}
			onClick={debounce ? debouncedOnClick : onClick}
			{...others}
		>
			{text}
		</Button>
	);
}
