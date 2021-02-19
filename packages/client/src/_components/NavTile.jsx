import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Colors, Elevation } from "../constants";

const useStyles = makeStyles((theme) => ({
	root: {
		height: "100%",
		width: "100%",
		color: Colors.WHITE,
		transition: "ease 0.3s",
		"&:hover": {
			cursor: "pointer",
			boxShadow: Elevation.TWO,
		},
	},
	centerWrapper: {
		display: "table",
		height: "100%",
		width: "100%",
	},
	center: {
		display: "table-cell",
		verticalAlign: "middle",
		textAlign: "center",
	},
}));

export default function NavTile(props) {
	const cls = useStyles();
	const { active, children, onClick, collapsed, ...others } = props;

	return (
		<div
			onClick={onClick}
			className={cls.root}
			style={
				active
					? {
							color: Colors.MAIN_BRAND,
							backgroundColor: !collapsed ? Colors.WHITE : Colors.LIGHT_SHADE,
							boxShadow: Elevation.FOUR,
					  }
					: {
							color: Colors.WHITE,
							opacity: 1,
					  }
			}
			{...others}
		>
			<div className={cls.centerWrapper}>
				<div className={cls.center}>{children}</div>
			</div>
		</div>
	);
}