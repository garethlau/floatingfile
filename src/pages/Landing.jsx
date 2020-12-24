import React, { useState } from "react";
import { Colors } from "../constants";
import { BASE_API_URL } from "../env";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import GInput from "../components/GInput";
import GButton from "../components/GButton";
import Seperator from "../components/Seperator";
import ReactGA from "react-ga";
import useDocumentTitle from "../hooks/useDocumentTitle";

ReactGA.pageview(window.location.pathname + window.location.search);

const anchorOrigin = {
	vertical: "top",
	horizontal: "center",
};

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: Colors.LIGHT_SHADE,
		height: "100vh",
		width: "100vw",
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
	content: {
		width: "250px",
		margin: "auto",
	},
	formInput: {
		margin: "10px 0px",
	},
}));

export default function Landing() {
	const cls = useStyles();
	const history = useHistory();
	const [code, setCode] = useState("");
	useDocumentTitle("floatingfile");

	function handleCodeChange(e) {
		if (e.target.value.length > 6) return;
		setCode(e.target.value.toUpperCase());
	}

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	async function join() {
		if (code.length !== 6) {
			enqueueSnackbar("Invalid code length.", {
				variant: "error",
				anchorOrigin,
			});
			return;
		}

		const format = /[ !@#$%^&*()_+\-=\]{};':"\\|,.<>?]/;

		if (format.test(code)) {
			// Contains special characters
			enqueueSnackbar("Invalid characters.", {
				variant: "error",
				anchorOrigin,
			});
			return;
		}

		try {
			const res = await axios.get(`${BASE_API_URL}/api/v3/space/` + code);
			console.log(res);
			enqueueSnackbar("Joining space.", {
				variant: "success",
				anchorOrigin,
			});
			setTimeout(() => {
				closeSnackbar();
				history.push("/s/" + code);
			}, 1500);
		} catch (err) {
			console.log(err.response);
			if (err.response.status === 404) {
				enqueueSnackbar("Space does not exist.", {
					variant: "error",
					anchorOrigin,
				});
			} else {
				enqueueSnackbar("There was an error.", {
					variant: "error",
					anchorOrigin,
				});
			}
		}
	}

	async function create() {
		try {
			const res = await axios.post(`${BASE_API_URL}/api/v3/space`);
			if (res.status === 200) {
				enqueueSnackbar("Space created. Redirecting...", {
					variant: "success",
					anchorOrigin,
				});
				setTimeout(() => {
					closeSnackbar();
					if (res.data.space && res.data.space.code) {
						history.push("/s/" + res.data.space.code);
					}
				}, 1500);
			}
		} catch {
			enqueueSnackbar("There was an error.", {
				variant: "error",
				anchorOrigin,
			});
		}
	}

	return (
		<div className={cls.root}>
			<div className={cls.centerWrapper}>
				<div className={cls.center}>
					<div className={cls.content}>
						<div className={cls.formInput}>
							<GInput
								onChange={handleCodeChange}
								value={code}
								placeholder="CODE"
								center
								fullWidth
								spellCheck={false}
								style={{ fontWeight: "bold", letterSpacing: "2px" }}
							/>
						</div>
						<div className={cls.formInput}>
							<GButton
								onClick={join}
								id="join-space-btn"
								text="JOIN A SPACE"
								variant="primary"
								fullWidth
								debounce={2}
							/>
						</div>

						<div style={{ margin: "20px 0" }}>
							<Seperator text={"OR"} />
						</div>

						<div className={cls.formInput}>
							<GButton
								onClick={create}
								id="create-space-btn"
								text="CREATE A SPACE"
								variant="primary"
								fullWidth
								debounce={2}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
