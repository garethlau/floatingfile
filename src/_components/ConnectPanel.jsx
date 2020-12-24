import React, { useState, useEffect } from "react";
import { Colors } from "../constants";
import GButton from "./GButton";
import QRCode from "qrcode.react";
import { makeStyles } from "@material-ui/core";
import MoonLoader from "react-spinners/MoonLoader";
import { ORIGIN } from "../env";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useSnackbar } from "notistack";
import Center from "./Center";

const useStyles = makeStyles((theme) => ({
	root: {
		display: "grid",
		height: "100%",
		width: "100%",
		gridTemplateRows: "70px auto 200px",
	},
	title: {
		color: Colors.LIGHT_ACCENT,
		textAlign: "center",
		[theme.breakpoints.up("sm")]: {
			textAlign: "left",
			marginLeft: "20px",
		},
	},
	code: {
		width: "200px",
		backgroundColor: Colors.LIGHT_ACCENT,
		fontSize: "32px",
		fontWeight: "bold",
		margin: "10px auto",
		borderRadius: "5px",
		color: Colors.WHITE,
		"&:hover": {
			cursor: "pointer",
		},
	},
}));

export default function ConnectPanel({ secondsRemaining, code, closeSpace }) {
	const cls = useStyles();
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const [timeLeft, setTimeLeft] = useState(secondsRemaining);
	useEffect(() => {
		setTimeLeft(secondsRemaining);
	}, [secondsRemaining]);
	useEffect(() => {
		if (!timeLeft) return;
		const intervalId = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
		return () => clearInterval(intervalId);
	}, [timeLeft]);

	return (
		<div className={cls.root}>
			<h2 className={cls.title}>Connect</h2>
			<Center>
				<div>
					<p style={{ opacity: 0.5 }}>Join this space:</p>
					<CopyToClipboard
						text={`${ORIGIN}/s/${code}`}
						onCopy={() => {
							enqueueSnackbar(`URL copied to clipboard.`, {
								variant: "success",
							});
							setTimeout(closeSnackbar, 3000);
						}}
					>
						<div className={cls.code}>{code ? code : ""}</div>
					</CopyToClipboard>

					<div>
						<QRCode
							value={`${ORIGIN}/s/${code}`}
							size={200}
							bgColor={"#ffffff"}
							fgColor={"#000000"}
							level={"L"}
							includeMargin={false}
							renderAs={"svg"}
							imageSettings={{
								src: require("../_assets/images/balloon.png"),
								x: null,
								y: null,
								height: 24,
								width: 24,
								excavate: true,
							}}
						/>
					</div>
				</div>
			</Center>
			<Center>
				<p style={{ opacity: 0.5, margin: 0 }}>Space will be destroyed in:</p>
				{timeLeft > 0 ? (
					<h2
						style={{
							fontFamily: "monospace",
							fontSize: "24px",
							margin: "16px",
						}}
					>
						{new Date(timeLeft * 1000).toISOString().substr(12, 7)}
					</h2>
				) : (
					<MoonLoader css="margin: auto; padding: 10px" loading color={Colors.MAIN_BRAND} size={32} />
				)}
				<div>
					<GButton text="Destroy Now" variant="danger" onClick={closeSpace} debounce={5} />
				</div>
			</Center>
		</div>
	);
}
