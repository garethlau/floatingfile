import React, { useState, useEffect, useCallback, Suspense } from "react";
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
import useRemoveFiles from "../_hooks/useRemoveFiles";
import useUploadFiles from "../_hooks/useUploadFiles";
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

	useDocumentTitle(`floatingfile | ${code}`);

	const { data: space, status: spaceStatus, refetch: refetchSpace } = useSpace(code);

	const [activePanel, setActivePanel] = useState(1);
	const [collapsed, setCollapsed] = useState(null);

	const [selected, setSelected] = useState([]);
	const [secondsRemaining, setSecondsRemaining] = useState(-1);

	const [uploadProgress, setUploadProgress] = useState({ loaded: null, total: null });

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const { mutateAsync: removeFiles, status: removeFilesStatus } = useRemoveFiles({
		code: getCodeFromWindow(window),
		onSuccess: () => setSelected([]),
	});

	const { mutateAsync: uploadFiles, status: uploadStatus } = useUploadFiles({ code: getCodeFromWindow(window) });

	const fileTransitions = useTransition(
		space?.files.sort((a, b) => new Date(parseInt(b.timestamp)) - new Date(parseInt(a.timestamp))),
		(file) => file._id,
		{
			from: { transform: "translate3d(0,-100px,0)", opacity: 0 },
			enter: { transform: "translate3d(0,0,0)", opacity: 1 },
			leave: { transform: "translate3d(0,-200px,0)", opacity: 0 },
		}
	);

	const selectFile = (id) => () => {
		// Prevent item select in mobile
		if (isMobile) return;
		if (selected.includes(id)) {
			// Remove from array
			let filtered = selected.filter((x) => x !== id);
			setSelected(filtered);
		} else {
			// Add to array
			setSelected([...selected, id]);
		}
	};

	const removeFile = (id) => () => {
		ReactGA.event({
			category: "File",
			action: "Removed file",
		});
		removeFiles([id]);
	};

	function removeSelected() {
		ReactGA.event({ category: "File", action: "Removed selected files" });
		removeFiles(selected);
	}

	const downloadFile = (id, filename) => async () => {
		if (isMobile) {
			ReactGA.event({
				category: "File",
				action: "Opened file",
			});
			const file = space.files.find((file) => file._id === id);
			const { location } = file;
			window.open(location, "_blank");
		} else {
			ReactGA.event({
				category: "File",
				action: "Downloaded file",
			});
			enqueueSnackbar("Your file will start downloading shortly.", {
				variant: "success",
				autoHideDuration: 3000,
			});
			try {
				const res = await axios({
					url: `${BASE_API_URL}/api/v3/space/${code}/files/${id}`,
					method: "GET",
					responseType: "blob",
					onDownloadProgress: (progress) => console.log(progress),
				});
				saveBlob(res.data, filename)
					.then(() => {
						console.log("Done downloading " + filename);
						enqueueSnackbar(`Successfully downloaded: ${filename}`, { variant: "success", autoHideDuration: 3000 });
					})
					.catch((err) => {
						console.log(err);
					});
			} catch (err) {
				console.log(err);
			}
		}
	};

	function selectAll() {
		setSelected(space.files.map((x) => x._id));
	}

	function deselectAll() {
		setSelected([]);
	}

	async function closeSpace() {
		ReactGA.event({
			category: "Space",
			action: "Closed space",
		});
		try {
			await axios.delete(`${BASE_API_URL}/api/v3/space/${code}`);
		} catch (err) {
			enqueueSnackbar("Error destroying space. Try reloading the page.", {
				variant: "error",
				action: <GButton text="Reload" onClick={() => window.location.reload(false)} variant="error" inverse />,
			});
		}
	}

	function downloadSelected() {
		ReactGA.event({ category: "File", action: "Downloaded selected files" });

		enqueueSnackbar(
			"Your files will start downloading shortly. Please ensure floatingfile has access to download multiple files.",
			{
				variant: "success",
				autoHideDuration: 3000,
			}
		);
		Promise.all(
			selected.map(
				(fileId) =>
					new Promise(async (resolve, reject) => {
						try {
							const res = await axios({
								url: `${BASE_API_URL}/api/v3/space/${code}/files/${fileId}`,
								method: "GET",
								responseType: "blob",
							});
							let file = space.files.filter((file) => file._id === fileId)[0];
							saveBlob(res.data, file.filename)
								.then(() => {
									resolve();
								})
								.catch((err) => {
									reject(err);
								});
						} catch (err) {}
					})
			)
		).then(() => {
			enqueueSnackbar("Successfully downloaded files.", {
				variant: "success",
				autoHideDuration: 3000,
			});
		});
	}

	async function zipSelected() {
		ReactGA.event({ category: "File", action: "Zipped selected files" });
		enqueueSnackbar("Your zipped files will start downloading shortly.", {
			variant: "success",
			autoHideDuration: 3000,
		});
		try {
			let res = await axios({
				url: `${BASE_API_URL}/api/v3/space/${code}/files/zip?files=${JSON.stringify(selected)}`,
				method: "GET",
				responseType: "blob",
				withCredentials: true,
			});
			let folderName = res.headers["content-disposition"].split("=")[1].replace(/"/g, "");
			await saveBlob(res.data, folderName);
			enqueueSnackbar("Successfully zipped files.", {
				variant: "success",
				autoHideDuration: 3000,
			});
			await axios.delete(`${BASE_API_URL}/api/v3/space/${code}/files/zip?folder=${folderName}`);
		} catch (err) {
			enqueueSnackbar(err.message, {
				variant: "error",
				autoHideDuration: 3000,
			});
		}
	}

	useEffect(() => {
		let timers = {
			expires: null,
			oneMinuteWarning: null,
			fiveMinuteWarning: null,
		};
		if (spaceStatus === "success") {
			let expiryDate = new Date(parseInt(space.expires));
			let currDate = new Date();
			let duration = expiryDate.getTime() - currDate.getTime();
			setSecondsRemaining(duration / 1000);
			if (duration < 0) {
				// This space has already expired
				enqueueSnackbar("This space has expired.", { variant: "error" });
			}
			if (duration - 5 * 60 * 1000 > 0) {
				// Set five minute warning timer
				timers.fiveMinuteWarning = setTimeout(() => {
					// Warn
					enqueueSnackbar("Space will expire in 5 minutes.", { variant: "warning" });
					setTimeout(() => closeSnackbar(), 3000);
					ReactGA.event({ category: "Space", action: "Displayed 5 minute warning.", nonInteraction: true });
				}, duration - 5 * 60 * 1000);
			}

			if (duration - 1 * 60 * 1000 > 0) {
				// Set one minute warning timer
				timers.oneMinuteWarning = setTimeout(() => {
					// Warn
					enqueueSnackbar("Space will expire in 1 minute.", { variant: "warning" });
					setTimeout(() => closeSnackbar(), 3000);
					ReactGA.event({ category: "Space", action: "Displayed 1 minute warning.", nonInteraction: true });
				}, duration - 1 * 60 * 1000);
			}

			if (duration > 0) {
				timers.expires = setTimeout(() => {
					// Expired !
					enqueueSnackbar("Space has expired. Redirecting...", { variant: "warning" });
					setTimeout(() => {
						closeSnackbar();
						history.push("/");
					}, 3000);
					ReactGA.event({ category: "Space", action: "Expired.", nonInteraction: true });
				}, duration);
			}
		} else if (spaceStatus === "error") {
			enqueueSnackbar("There was an error loading the space. Please reload the page.", {
				variant: "error",
				action: <GButton text={"Reload"} variant="danger" inverse onClick={() => window.location.reload(false)} />,
			});
		}

		return () => {
			Object.keys(timers).forEach((timerName) => {
				clearTimeout(timers[timerName]);
			});
		};
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
					break;
				case "FILES_UPDATED":
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

	const onDrop = useCallback(
		(acceptedFiles) => {
			let showLargeFileWarning = false;
			let exceededFileSizeLimit = false;
			acceptedFiles.forEach((file) => {
				if (file.size > 314572800) {
					// Greater than 300 MB
					exceededFileSizeLimit = true;
				}
				if (file.size > 104857600) {
					// Greater than 100 MB
					showLargeFileWarning = true;
				}
			});
			if (exceededFileSizeLimit) {
				enqueueSnackbar("A file you are trying to upload is too large.", {
					autoHideDuration: 5000,
					variant: "error",
					action: !isMobile && (
						<GButton
							text="Learn More"
							variant="danger"
							inverse
							target="_blank"
							href="https://floatingfile.space/faq?active=2"
						/>
					),
				});
				return;
			}
			if (showLargeFileWarning) {
				enqueueSnackbar("You're uploading a large file. Please be patient as the upload will take some time.", {
					variant: "warning",
					autoHideDuration: 5000,
				});
			}

			ReactGA.event({ category: "File", action: "Uploaded files", value: acceptedFiles.length });

			const config = {
				withCredentials: true,
				headers: {
					"content-Type": "application/json",
				},
				onUploadProgress: (event) => {
					const { loaded, total } = event;
					setUploadProgress({ loaded, total });
					if (loaded === total) {
						setUploadProgress({ loaded: null, total: null });
					}
				},
			};
			uploadFiles({ files: acceptedFiles, config });
		},
		[code]
	);

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
						{selected.length === space.files.length ? (
							<GButton text="Deselect All" variant="primary" inverse startIcon={<ClearIcon />} onClick={deselectAll} />
						) : (
							<GButton
								onClick={selectAll}
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
						<ConnectPanel secondsRemaining={secondsRemaining} code={code} closeSpace={closeSpace} />
					</Suspense>
				</div>
				<div style={{ display: activePanel === 2 ? "inherit" : "none" }}>
					<Suspense fallback={panelFallback}>
						<HistoryPanel history={space.history} />
					</Suspense>
				</div>
				<div style={{ display: activePanel === 3 ? "inherit" : "none" }}>
					<Suspense fallback={panelFallback}>
						<UsersPanel users={space.users} mySocketId={socket.id} />
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
						{windowWidth > Breakpoints.MD && <>{space.files.length > 0 ? appBar : <div></div>}</>}
						<div style={{ overflowY: "auto", height: "100%" }}>
							{!collapsed || (collapsed && activePanel === 0) ? (
								<>
									{space.files.length > 0 ? (
										<>
											{windowWidth > Breakpoints.SM && windowWidth < Breakpoints.MD && appBar}
											{windowWidth < Breakpoints.SM && (
												<div>
													<Center>
														<div style={{ padding: "10px", display: space.files.length === 0 ? "none" : "" }}>
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
												{fileTransitions.map(({ item, props, key }) => {
													const { _id, filename } = item;
													return (
														<animated.div key={key} style={props}>
															<div key={_id}>
																<Suspense fallback={null}>
																	<FileListItem
																		remove={removeFile(_id)}
																		download={downloadFile(_id, filename)}
																		active={selected.includes(_id)}
																		select={selectFile(_id)}
																		{...item}
																	/>
																</Suspense>
															</div>
														</animated.div>
													);
												})}
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
											<ConnectPanel secondsRemaining={secondsRemaining} code={code} closeSpace={closeSpace} />
										</Suspense>
									</div>
									<div style={{ display: activePanel === 2 ? "inherit" : "none" }}>
										<Suspense fallback={panelFallback}>
											<HistoryPanel history={space.history} collapsed />
										</Suspense>
									</div>
									<div style={{ display: activePanel === 3 ? "inherit" : "none" }}>
										<Suspense fallback={panelFallback}>
											<UsersPanel users={space.users} collapsed mySocketId={socket.id} />
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
