import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Colors, Elevation } from "../constants";
import Center from "./Center";
import { mdiUpload, mdiDownload, mdiDelete, mdiTimerSandEmpty, mdiAccountPlus, mdiAccountMinus } from "@mdi/js";
import Icon from "@mdi/react";

const useStyles = makeStyles((theme) => ({
	root: {
		display: "grid",
		gridTemplateRows: "64px calc(100vh - 64px - 64px)",
		height: "100%",
		width: "100%",
		[theme.breakpoints.up("md")]: {
			gridTemplateRows: "64px calc(100vh - 64px)",
		},
	},
	title: {
		color: Colors.LIGHT_ACCENT,
		textAlign: "center",
		[theme.breakpoints.up("sm")]: {
			textAlign: "left",
			marginLeft: "20px",
		},
	},
	tileContainer: {
		[theme.breakpoints.up("md")]: {
			overflowY: "auto",
		},
	},
	tile: {
		display: "grid",
		borderRadius: "5px",
		gridTemplateColumns: "48px calc(100vw - 48px - 50px)",
		height: "48px",
		padding: "5px",
		margin: "10px",
		boxShadow: Elevation.ONE,
		[theme.breakpoints.up("md")]: {
			gridTemplateColumns: "48px 168px",
			margin: "5px",
			boxShadow: "none",
		},
	},
}));

function renderIcon(action) {
	let path = "";
	switch (action) {
		case "UPLOAD":
			path = mdiUpload;
			break;
		case "DOWNLOAD":
			path = mdiDownload;
			break;
		case "REMOVE":
			path = mdiDelete;
			break;
		case "LEAVE":
			path = mdiAccountMinus;
			break;
		case "JOIN":
			path = mdiAccountPlus;
			break;
		case "EXPIRED":
			path = mdiTimerSandEmpty;
			break;
		default:
			console.log(action);
	}
	return <Icon color={Colors.PRIMARY} path={path} size="24px" />;
}

function renderTile(action, payload, author) {
	switch (action) {
		case "EXPIRED":
			return (
				<>
					<p style={{ marginTop: "10px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
						{payload}
					</p>
				</>
			);
		case "JOIN":
		case "LEAVE":
			return (
				<>
					<p style={{ marginTop: "10px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
						{author}
					</p>
				</>
			);
		case "UPLOAD":
		case "DOWNLOAD":
		case "REMOVE":
		default:
			return (
				<>
					<p style={{ margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{payload}</p>
					<p style={{ margin: 0, opacity: 0.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
						{author}
					</p>
				</>
			);
	}
}

export default function HistoryPanel(props) {
	const { history, collapsed } = props;
	const cls = useStyles();
	return (
		<div className={cls.root}>
			<h2 className={cls.title}>History</h2>
			<div className={cls.tileContainer}>
				{history
					.sort((a, b) => {
						return new Date(b.timestamp) - new Date(a.timestamp);
					})
					.map(({ payload, author, action }, index) => {
						return (
							<div
								className={cls.tile}
								style={{ backgroundColor: !collapsed ? Colors.LIGHT_SHADE : Colors.WHITE }}
								key={index}
							>
								<div>
									<Center>{renderIcon(action)}</Center>
								</div>
								<div>{renderTile(action, payload, author)}</div>
							</div>
						);
					})}
			</div>
		</div>
	);
}
