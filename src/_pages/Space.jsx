import React, { useState, useEffect, useCallback, Suspense, useContext } from "react";
import { SOCKET_URL, BASE_API_URL, USERNAME_STORAGE_KEY, LAST_VISIT_STORAGE_KEY } from "../env";
import { Colors, Breakpoints } from "../constants";
import { useHistory, useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import io from "socket.io-client";
import { useTransition, animated } from "react-spring";
import { isMobile } from "react-device-detect";
import MoonLoader from "react-spinners/MoonLoader";
import { useSnackbar } from "notistack";
import ReactGA from "react-ga";
import useWindowWidth from "../_hooks/useWindowWidth";
import useSpace from "../_queries/useSpace";
import useDocumentTitle from "../_hooks/useDocumentTitle";
import { saveBlob, getCodeFromWindow } from "../_utils";
import { makeStyles } from "@material-ui/core/styles";
import PublicIcon from "@material-ui/icons/Public";
import HistoryIcon from "@material-ui/icons/History";
import PeopleIcon from "@material-ui/icons/People";
import FolderIcon from "@material-ui/icons/Folder";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import Button from "@material-ui/core/Button";
import PlaylistAddCheckIcon from "@material-ui/icons/PlaylistAddCheck";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import DeleteIcon from "@material-ui/icons/Delete";
import ClearIcon from "@material-ui/icons/Clear";
import FileUploadBtn from "../_components/FileUploadBtn";
import UploadProgress from "../_components/UploadProgress";
import Center from "../_components/Center";
import GButton from "../_components/GButton";
import NavTile from "../_components/NavTile";
import GIconButton from "../_components/GIconButton";
import IntroToast from "../_components/IntroToast";
import { v4 as uuidv4 } from "uuid";
import useFiles from "../_queries/useFiles";
import useUploadFile from "../_mutations/useUploadFile";
import { SelectedFilesContext } from "../_contexts/selectedFiles";
import { default as useSpaceHistory } from "../_queries/useHistory";
import useRemoveFiles from "../_mutations/useRemoveFiles";

const ConnectPanel = React.lazy(() => import("../_components/ConnectPanel"));
const HistoryPanel = React.lazy(() => import("../_components/HistoryPanel"));
const UsersPanel = React.lazy(() => import("../_components/UsersPanel"));
const FileListItem = React.lazy(() => import("../_components/FileListItem"));

ReactGA.pageview(window.location.pathname + window.location.search);

const useStyles = makeStyles((theme) => ({
	root: {
		width: "100vw",
		height: "100vh",
		display: "grid",
		[theme.breakpoints.up("xs")]: {
			// gridTemplateAreas: "'main' 'nav'",
			// gridTemplateRows: "calc(100vh - 64px) 64px",
			gridTemplateAreas: "'nav' 'main'",
			gridTemplateRows: "64px auto",
			gridTemplateColumns: "1fr",
		},
		[theme.breakpoints.up("sm")]: {
			gridTemplateAreas: "'main' 'nav'",
			gridTemplateRows: "calc(100vh - 64px) 64px",
		},
		[theme.breakpoints.up("md")]: {
			gridTemplateAreas: "'nav panel main'",
			gridTemplateRows: "100vh",
			gridTemplateColumns: "80px 240px auto",
		},
		[theme.breakpoints.up("lg")]: {},
		[theme.breakpoints.up("xl")]: {},
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
	nav: {
		gridArea: "nav",
		backgroundColor: Colors.MAIN_BRAND,
		display: "grid",
		gridTemplateColumns: "repeat(5, 64px)",
		gridTemplateRows: "1fr",
		[theme.breakpoints.up("md")]: {
			gridTemplateColumns: "1fr",
			gridTemplateRows: "repeat(4, 80px)",
		},
	},
	filesTab: {
		[theme.breakpoints.up("md")]: {
			display: "none",
		},
	},
	panel: {
		[theme.breakpoints.down("sm")]: {
			display: "none",
		},
		gridArea: "panel",
		backgroundColor: Colors.WHITE,
	},
	main: {
		gridArea: "main",
		backgroundColor: Colors.LIGHT_SHADE,
		display: "grid",
		gridTemplateRows: "auto",
		[theme.breakpoints.up("sm")]: {
			gridTemplateRows: "calc(100vh - 64px)",
		},
		[theme.breakpoints.up("md")]: {
			gridTemplateRows: "64px calc(100vh - 64px)",
		},
		[theme.breakpoints.up("lg")]: {},
	},
	appBar: {
		height: "64px",
		padding: "0px 10px",
		backgroundColor: Colors.MAIN_BRAND,
	},
	left: {
		float: "left",
		height: "64px",
		width: "min-content",
		padding: "0 10px 0 0",
	},
	right: {
		float: "right",
		height: "64px",
		width: "min-content",
		margin: "0 0 0 10px",
	},
	uploadZone: {
		width: "100%",
		height: "100%",
		"&:hover": {
			cursor: "pointer",
		},
		"&:focus": {
			outline: "none",
		},
	},
}));

let socket = io(SOCKET_URL);

const panelFallback = null;

export default function Space() {
	const cls = useStyles();
	const windowWidth = useWindowWidth();
	const history = useHistory();
	const { code } = useParams();
	const { selected, isSelected, clear: clearSelectedFiles } = useContext(SelectedFilesContext);

	useDocumentTitle(`floatingfile | ${code}`);

	const { data: space, status: spaceStatus, refetch: refetchSpace } = useSpace(code);

	const [activePanel, setActivePanel] = useState(1);
	const [collapsed, setCollapsed] = useState(null);

	const [uploadProgress, setUploadProgress] = useState({ loaded: null, total: null });

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const { mutateAsync: uploadFile } = useUploadFile(code);

	const { data: files, refetch: refetchFiles } = useFiles(code);
	const { refetch: refetchHistory } = useSpaceHistory(code);
	const { mutateAsync: removeFiles } = useRemoveFiles(code);

	async function downloadSelected() {
		enqueueSnackbar(
			"Your files will start downloading shortly. Please ensure floatingfile has access to download multiple files.",
			{
				variant: "success",
				autoHideDuration: 3000,
			}
		);

		let downloadQueue = files.filter((file) => isSelected(file.key));
		while (downloadQueue.length > 0) {
			const file = downloadQueue.shift();
			console.log("Donwloading file ", file.name);
			const response = await axios.get(file.signedUrl, { responseType: "blob" });
			const { data } = response;
			await saveBlob(data, file.name);
			await axios.patch(`${BASE_API_URL}/api/v4/spaces/${code}/history`, {
				action: "DOWNLOAD_FILE",
				payload: file.key,
			});
		}
		console.log("All files donwloaded");
	}

	async function removeSelected() {
		try {
			let keysToRemove = selected;
			await removeFiles(keysToRemove);
			clearSelectedFiles();
			enqueueSnackbar("Selected files have been removed", { variant: "success" });
		} catch (error) {
			console.error(error);
		}
	}

	async function zipSelected() {
		ReactGA.event({ category: "File", action: "Zipped selected files" });
		enqueueSnackbar("Your zipped files will start downloading shortly.", {
			variant: "success",
			autoHideDuration: 3000,
		});
		try {
			const response = await axios.get(
				`${BASE_API_URL}/api/v4/spaces/${code}/files/zip?keys=${JSON.stringify(selected)}`,
				{
					responseType: "blob",
				}
			);
			let folderName = response.headers["content-disposition"].split("=")[1].replace(/"/g, "");
			const { data } = response;
			await saveBlob(data, folderName);
			enqueueSnackbar("Successfully zipped files.", {
				variant: "success",
				autoHideDuration: 3000,
			});
			await axios.delete(`${BASE_API_URL}/api/v4/spaces/${code}/files/zip?folder=${folderName}`);
		} catch (err) {
			enqueueSnackbar(err.message, {
				variant: "error",
				autoHideDuration: 3000,
			});
		}
	}

	useEffect(() => {
		if (spaceStatus === "success") {
		} else if (spaceStatus === "error") {
			enqueueSnackbar("There was an error loading the space. Please reload the page.", {
				variant: "error",
				action: <GButton text={"Reload"} variant="danger" inverse onClick={() => window.location.reload(false)} />,
			});
		}
	}, [spaceStatus]);

	useEffect(() => {
		if (code) {
			socket.emit("FROM_CLIENT", {
				type: "JOIN_SPACE",
				payload: localStorage.getItem(USERNAME_STORAGE_KEY),
				code,
			});

			// Show intro modal
			let weekAgo = new Date();
			weekAgo.setDate(weekAgo.getDate() - 7);
			let lastVisit = localStorage.getItem(LAST_VISIT_STORAGE_KEY);
			if (!lastVisit || new Date(lastVisit) < new Date(weekAgo)) {
				const key = enqueueSnackbar(<IntroToast handleClose={() => closeSnackbar(key)} />, {
					persist: true,
					anchorOrigin: {
						vertical: "top",
						horizontal: "right",
					},
				});
			}

			// Set last visit date
			localStorage.setItem(LAST_VISIT_STORAGE_KEY, new Date());
		}
	}, [code]);

	useEffect(
		() => () => {
			socket.emit("FROM_CLIENT", { type: "LEAVE_SPACE" });
		},
		[]
	);

	useEffect(() => {
		socket.open();
		socket.on("FROM_SERVER", (action) => {
			const { type, payload, code } = action;
			console.log("Socket Event Type: " + type);
			if (payload) {
				console.log("Payload: ", payload);
			}
			switch (type) {
				case "SPACE_UPDATED":
					refetchSpace();
					break;
				case "HISTORY_UPDATED":
					refetchHistory();
					break;
				case "FILES_UPDATED":
					refetchFiles();
					break;
				case "CONNECTIONS_UPDATED":
					break;
				case "CLOSE":
				case "SPACE_DESTROYED":
					enqueueSnackbar("Space has been destroyed.", { variant: "error" });
					setTimeout(() => {
						closeSnackbar();
						history.push("/");
						socket.close();
					}, 3000);
					break;
				default:
					console.log("Not Handled: " + type);
			}
		});
		return () => {
			console.log("Off");
			socket.off("FROM_SERVER");
		};
	}, [enqueueSnackbar, closeSnackbar, history]);

	useEffect(() => {
		if (collapsed === null) {
			// First time
			if (windowWidth < 960) {
				setCollapsed(true);
				setActivePanel(0);
			} else {
				setCollapsed(false);
				setActivePanel(1);
			}
		} else {
			if (windowWidth < 960 && !collapsed) {
				// Collapsing from desktop to mobile
				setCollapsed(true);
				setActivePanel(0);
			}
			if (windowWidth > 960 && collapsed) {
				// Expanding from mobile to desktop
				setCollapsed(false);
				setActivePanel(1);
			}
			if (windowWidth > 960) {
				setCollapsed(false);
			}
		}
	}, [windowWidth, collapsed]);

	const changeActivePanel = (index) => () => {
		setActivePanel(index);
	};

	const onDrop = useCallback(async (acceptedFiles) => {
		let queue = [
			...acceptedFiles.map((file) => {
				const key = uuidv4();
				const ext = file.name.split(".")[file.name.split(".").length - 1];

				file.key = key;
				file.ext = ext;
				return file;
			}),
		];

		while (queue.length > 0) {
			const file = queue.shift();
			console.log("Start file upload ", file.name);
			await uploadFile(file);
			console.log("Done file upload ", file.name);
		}
	}, []);

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
	});

	const appBar = (
		<div className={cls.appBar}>
			<div className={cls.left}>
				<div className={cls.centerWrapper}>
					<div className={cls.center}>
						<div {...getRootProps()}>
							<input {...getInputProps()} />
							{uploadProgress.loaded ? (
								<Center>
									<UploadProgress
										textColor={Colors.WHITE}
										loaded={uploadProgress.loaded}
										total={uploadProgress.total}
									/>
								</Center>
							) : windowWidth > 600 ? (
								<GButton
									text="Upload"
									variant="success"
									startIcon={<CloudUploadIcon style={{ marginLeft: "5px" }} />}
								/>
							) : (
								<GIconButton variant="success">
									<CloudUploadIcon />
								</GIconButton>
							)}
						</div>
					</div>
				</div>
			</div>
			<div className={cls.left}>
				<div className={cls.centerWrapper}>
					<div className={cls.center} style={{ textAlign: "left" }}>
						{selected.length === files?.length ? (
							<GButton text="Deselect All" variant="primary" inverse startIcon={<ClearIcon />} onClick={null} />
						) : (
							<GButton
								onClick={null}
								text="Select All"
								variant="primary"
								inverse
								startIcon={<PlaylistAddCheckIcon />}
							/>
						)}
					</div>
				</div>
			</div>
			<div className={cls.right}>
				<div className={cls.centerWrapper}>
					<div className={cls.center}>
						<GButton
							text="ZIP"
							variant="primary"
							disabled={selected.length === 0}
							inverse
							onClick={zipSelected}
							startIcon={<FolderIcon />}
							debounce={2}
						/>
					</div>
				</div>
			</div>
			<div className={cls.right}>
				<div className={cls.centerWrapper}>
					<div className={cls.center}>
						<GButton
							text="Download"
							variant="primary"
							disabled={selected.length === 0}
							inverse
							startIcon={<CloudDownloadIcon />}
							onClick={downloadSelected}
							debounce={2}
						/>
					</div>
				</div>
			</div>
			<div className={cls.right}>
				<div className={cls.centerWrapper}>
					<div className={cls.center}>
						<GButton
							text="Remove"
							variant="primary"
							disabled={selected.length === 0}
							inverse
							startIcon={<DeleteIcon />}
							onClick={removeSelected}
							debounce={5}
						/>
					</div>
				</div>
			</div>
		</div>
	);

	const dropZone = (
		<div {...getRootProps()} className={cls.uploadZone}>
			<div className={cls.centerWrapper}>
				<input {...getInputProps()} />
				<div className={cls.center}>
					{!collapsed ? (
						<>
							<p style={{ opacity: 0.7, margin: 5 }}>Drag and drop files</p>
							<p style={{ opacity: 0.7, margin: 5 }}>or</p>
						</>
					) : (
						<p style={{ opacity: 0.7, margin: 5 }}>It's pretty empty here...</p>
					)}
					<div>
						<GButton text="Upload" variant="success" startIcon={<CloudUploadIcon />} />
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<div className={cls.root}>
			<div className={cls.nav}>
				<div className={cls.filesTab}>
					<NavTile onClick={changeActivePanel(0)} active={activePanel === 0} collapsed={collapsed}>
						<FolderIcon />
					</NavTile>
				</div>
				<div>
					<NavTile onClick={changeActivePanel(1)} active={activePanel === 1} collapsed={collapsed}>
						<PublicIcon />
					</NavTile>
				</div>
				<div>
					<NavTile onClick={changeActivePanel(2)} active={activePanel === 2} collapsed={collapsed}>
						<HistoryIcon />
					</NavTile>
				</div>
				<div>
					<NavTile onClick={changeActivePanel(3)} active={activePanel === 3} collapsed={collapsed}>
						<PeopleIcon />
					</NavTile>
				</div>
				{/* <div>
					<NavTile onClick={changeActivePanel(4)} active={activePanel === 4} collapsed={collapsed}>
						<SettingsIcon />
					</NavTile>
				</div> */}
			</div>
			<div className={cls.panel}>
				<div style={{ display: activePanel === 1 ? "inherit" : "none", height: "100%" }}>
					<Suspense fallback={panelFallback}>
						<ConnectPanel />
					</Suspense>
				</div>
				<div style={{ display: activePanel === 2 ? "inherit" : "none" }}>
					<Suspense fallback={panelFallback}>
						<HistoryPanel />
					</Suspense>
				</div>
				<div style={{ display: activePanel === 3 ? "inherit" : "none" }}>
					<Suspense fallback={panelFallback}>
						<UsersPanel mySocketId={socket.id} />
					</Suspense>
				</div>
				<div style={{ display: activePanel === 4 ? "inherit" : "none" }}>Settings</div>
			</div>
			<div className={cls.main}>
				{spaceStatus === "loading" ? (
					<>
						{!collapsed && <div></div>}
						<Center>
							<MoonLoader css="margin: auto;" color={Colors.MAIN_BRAND} size={32} />
						</Center>
					</>
				) : (
					<>
						{windowWidth > Breakpoints.MD && <>{files?.length > 0 ? appBar : <div></div>}</>}
						<div style={{ overflowY: "auto", height: "100%" }}>
							{!collapsed || (collapsed && activePanel === 0) ? (
								<>
									{files?.length > 0 ? (
										<>
											{windowWidth > Breakpoints.SM && windowWidth < Breakpoints.MD && appBar}
											{windowWidth < Breakpoints.SM && (
												<div>
													<Center>
														<div style={{ padding: "10px", display: files?.length === 0 ? "none" : "" }}>
															{uploadProgress.loaded ? (
																<Button style={{ backgroundColor: Colors.SUCCESS, height: "42px" }} fullWidth>
																	<UploadProgress
																		loaded={uploadProgress.loaded}
																		total={uploadProgress.total}
																		textColor={Colors.WHITE}
																		ringColor={Colors.WHITE}
																		noText={isMobile}
																	/>
																</Button>
															) : (
																<FileUploadBtn handleFiles={onDrop} />
															)}
														</div>
													</Center>
												</div>
											)}
											<div>
												{files?.map((file) => (
													<Suspense fallback={null}>
														<FileListItem file={file} />
													</Suspense>
												))}
											</div>
										</>
									) : uploadProgress.loaded ? (
										<Center>
											<UploadProgress loaded={uploadProgress.loaded} total={uploadProgress.total} />
										</Center>
									) : (
										dropZone
									)}
								</>
							) : (
								<>
									<div style={{ display: activePanel === 1 ? "inherit" : "none", height: "100%" }}>
										<Suspense fallback={panelFallback}>
											<ConnectPanel />
										</Suspense>
									</div>
									<div style={{ display: activePanel === 2 ? "inherit" : "none" }}>
										<Suspense fallback={panelFallback}>
											<HistoryPanel collapsed />
										</Suspense>
									</div>
									<div style={{ display: activePanel === 3 ? "inherit" : "none" }}>
										<Suspense fallback={panelFallback}>
											<UsersPanel collapsed mySocketId={socket.id} />
										</Suspense>
									</div>
									<div style={{ display: activePanel === 4 ? "inherit" : "none" }}>Settings</div>
								</>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
