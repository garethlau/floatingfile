import React, { useState } from "react";
import { Colors } from "../constants";
import { BASE_API_URL } from "../env";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import GInput from "../_components/GInput";
import Button from "../_components/Button";
import Seperator from "../_components/Seperator";
import ReactGA from "react-ga";
import useDocumentTitle from "../_hooks/useDocumentTitle";
import useCreateSpace from "../_mutations/useCreateSpace";

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
	const { mutateAsync: createSpace, isLoading: creatingSpace } = useCreateSpace();
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
			await axios.get(`${BASE_API_URL}/api/v4/spaces/` + code);
			enqueueSnackbar("Joining space.", {
				variant: "success",
				anchorOrigin,
			});
			setTimeout(() => {
				closeSnackbar();
				history.push("/s/" + code);
			}, 1500);
		} catch (err) {
			console.log(err);
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
			const space = await createSpace();
			if (space && space.code) {
				history.push("/s/" + space.code);
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
							<Button onClick={join} id="join-space-btn" variant="primary" fullWidth>
								Join
							</Button>
						</div>

						<div style={{ margin: "20px 0" }}>
							<Seperator text={"OR"} />
						</div>

						<div className={cls.formInput}>
							<Button onClick={create} isLoading={creatingSpace} id="create-space-btn" variant="primary" fullWidth>
								Create a Space
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
