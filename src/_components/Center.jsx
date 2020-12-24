import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
	root: {
		display: "table",
		height: "100%",
		width: "100%",
	},

	content: {
		display: "table-cell",
		verticalAlign: "middle",
		textAlign: "center",
	},
}));

export default function Center(props) {
	const cls = useStyles();
	return (
		<div className={cls.root}>
			<div className={cls.content}>{props.children}</div>
		</div>
	);
}
