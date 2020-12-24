import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Colors, Elevation } from "../constants";
import FaceIcon from "@material-ui/icons/Face";
import Center from "./Center";

const useStyles = makeStyles((theme) => ({
	root: {
		display: "grid",
		gridTemplateRows: "64px calc(100vh - 128px)",
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
		gridTemplateColumns: "48px 168px",
		borderRadius: "5px",
		height: "48px",
		padding: "5px",
		margin: "10px",
		boxShadow: Elevation.ONE,
		[theme.breakpoints.up("md")]: {
			margin: "5px",
			boxShadow: "none",
		},
	},
}));

export default function UsersPanel(props) {
	const { users, mySocketId, collapsed } = props;
	const cls = useStyles();
	return (
		<div className={cls.root}>
			<h2 className={cls.title}>Users</h2>
			<div className={cls.tileContainer}>
				{users.map(({ username, socketId }, index) => {
					return (
						<div
							className={cls.tile}
							style={{ backgroundColor: !collapsed ? Colors.LIGHT_SHADE : Colors.WHITE }}
							key={index}
						>
							<div>
								<Center>
									<FaceIcon style={{ color: username.split("-")[0], fontSize: 36 }} />
								</Center>
							</div>

							{mySocketId === socketId ? (
								<div>
									<p
										style={{
											margin: 0,
											fontWeight: 500,
											whiteSpace: "nowrap",
											overflow: "hidden",
											textOveflow: "ellipsis",
										}}
									>
										{username}
									</p>

									<p
										style={{
											margin: 0,
											opacity: 0.7,
											whiteSpace: "nowrap",
											overflow: "hidden",
											textOveflow: "ellipsis",
										}}
									>
										(me)
									</p>
								</div>
							) : (
								<div>
									<p
										style={{
											marginTop: "10px",
											fontWeight: 500,
											whiteSpace: "nowrap",
											overflow: "hidden",
											textOveflow: "ellipsis",
										}}
									>
										{username}
									</p>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
