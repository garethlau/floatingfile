import React, { useState, useEffect } from "react";
import { Colors } from "../constants";
import QRCode from "qrcode.react";
import { makeStyles } from "@material-ui/core";
import MoonLoader from "react-spinners/MoonLoader";
import { ORIGIN } from "../env";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useSnackbar } from "notistack";
import Center from "./Center";
import useSpace from "../_queries/useSpace";
import { useParams, useHistory } from "react-router-dom";
import useDeleteSpace from "../_mutations/useDeleteSpace";
import Button from "./Button";

const THIRTY_MINUTES = 30 * 60 * 1000;
const FIVE_MINUTES = 5 * 60 * 1000;

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

export default function ConnectPanel() {
	const cls = useStyles();
	const { code } = useParams();
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const { data: space } = useSpace(code);
	const history = useHistory();
	const { mutateAsync: deleteSpace } = useDeleteSpace(code);

	const [timeLeft, setTimeLeft] = useState(); // In seconds

	async function close() {
		try {
			await deleteSpace();
			history.push("/");
		} catch (error) {
			console.error(error);
		}
	}

	useEffect(() => {
		let timers = {};
		if (space) {
			let expiryDate = new Date(parseInt(space.expires));
			let currDate = new Date();
			let duration = expiryDate.getTime() - currDate.getTime();

			if (duration < 0) {
				// This space has already expired
				enqueueSnackbar("This space has expired.", { variant: "error" });
			}

			if (duration - FIVE_MINUTES > 0) {
				// Set five minute timeout warning
				timers.five = setTimeout(() => {
					enqueueSnackbar("Space will expire in 5 minutes.", { variant: "warning" });
					setTimeout(() => closeSnackbar(), 5000);
				}, duration - FIVE_MINUTES);
			}

			if (duration - THIRTY_MINUTES > 0) {
				// Set thirty minute timeout warning
				timers.thirty = setTimeout(() => {
					enqueueSnackbar("Space will expire in 30 minutes.", { variant: "warning" });
					setTimeout(() => closeSnackbar(), 5000);
				}, duration - THIRTY_MINUTES);
			}

			if (duration > 0) {
				timers.zero = setTimeout(() => {
					enqueueSnackbar("Space has expired. Redirecting...", { variant: "warning" });
					setTimeout(() => {
						closeSnackbar();
						history.push("/");
					});
				}, duration);
			}

			setTimeLeft(duration / 1000);
		}
		return () => {
			// Clear timeouts
			Object.keys(timers).forEach((timerName) => {
				clearTimeout(timers[timerName]);
			});
		};
	}, [space]);

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
								src: require("../_assets/images/floatingfile.png"),
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
						{new Date(timeLeft * 1000).toISOString().substr(11, 8)}
					</h2>
				) : (
					<MoonLoader css="margin: auto; padding: 10px" loading color={Colors.MAIN_BRAND} size={32} />
				)}
				<div>
					<Button variant="danger" onClick={close} debounce={5}>
						Destroy Now
					</Button>
				</div>
			</Center>
		</div>
	);
}
