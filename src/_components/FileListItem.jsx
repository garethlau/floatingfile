import React, { useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Colors, Elevation } from "../constants";
import GButton from "./GButton";
import GIconButton from "./GIconButton";
import Center from "./Center";
import useWindowWidth from "../_hooks/useWindowWidth";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import DeleteIcon from "@material-ui/icons/Delete";
import OpenInBrowserIcon from "@material-ui/icons/OpenInBrowser";
import {
	mdiMicrosoftWord,
	mdiMicrosoftPowerpoint,
	mdiMicrosoftExcel,
	mdiImageOutline,
	mdiCodeJson,
	mdiLanguageJavascript,
	mdiLanguageHtml5,
	mdiLanguagePython,
	mdiFilePdfOutline,
	mdiFileDocumentOutline,
	mdiFileQuestionOutline,
	mdiFolderZipOutline,
	mdiSvg,
	mdiLanguageSwift,
	mdiLanguageCss3,
	mdiGif,
	mdiLanguageC,
	mdiLanguageCpp,
	mdiLanguageCsharp,
	mdiLanguageGo,
	mdiLanguageFortran,
	mdiLanguageHaskell,
	mdiLanguageTypescript,
	mdiLanguageJava,
	mdiLanguageKotlin,
	mdiLanguageMarkdown,
	mdiLanguagePhp,
	mdiLanguageR,
	mdiLanguageRuby,
	mdiLanguageXaml,
} from "@mdi/js";
import Icon from "@mdi/react";
import { isMobile } from "react-device-detect";
import useRemoveFile from "../_mutations/useRemoveFile";
import { useParams } from "react-router-dom";
import { SelectedFilesContext } from "../_contexts/selectedFiles";
import axios from "axios";
import { saveBlob } from "../_utils";
import { BASE_API_URL } from "../env";

const useStyles = makeStyles((theme) => ({
	root: {
		display: "grid",
		gridTemplateRows: "64px",
		gridTemplateAreas: "'icon text remove download'",
		gridTemplateColumns: "64px auto 55px 55px",
		[theme.breakpoints.up("sm")]: {
			// gridTemplateAreas: "'icon text remove download'",
			gridTemplateColumns: "64px auto 85px 115px",
			"&:hover": {
				boxShadow: Elevation.TWO,
			},
		},
		padding: "0px 10px 0px 0px",
		boxShadow: Elevation.ONE,
		margin: "10px 10px",
		borderRadius: "5px",
		transition: "ease 0.3s",
	},
	inactive: {
		borderRadius: "50%",
		borderColor: Colors.MAIN_BRAND,
		borderStyle: "solid",
		width: "24px",
		height: "24px",
		margin: "auto",
	},
	active: {
		borderRadius: "50%",
		backgroundColor: Colors.MAIN_BRAND,
		borderColor: Colors.MAIN_BRAND,
		borderStyle: "solid",
		width: "24px",
		height: "24px",
		margin: "auto",
	},
	select: {
		gridArea: "select",
		display: "none",
		[theme.breakpoints.up("sm")]: {
			display: "inherit",
			"&:hover": {
				cursor: "pointer",
			},
		},
	},
	icon: {
		gridArea: "icon",
		[theme.breakpoints.up("sm")]: {
			"&:hover": {
				cursor: "pointer",
			},
		},
	},
	text: {
		gridArea: "text",
		[theme.breakpoints.up("sm")]: {
			"&:hover": {
				cursor: "pointer",
			},
		},
	},

	remove: {
		gridArea: "remove",
		[theme.breakpoints.up("sm")]: {
			"&:hover": {
				cursor: "pointer",
			},
		},
	},
	download: {
		gridArea: "download",
		[theme.breakpoints.up("sm")]: {
			"&:hover": {
				cursor: "pointer",
			},
		},
	},
	loadingContainer: {
		display: "grid",
		gridTemplateRows: "64px",
		gridTemplateColumns: "64px auto",
		padding: "0px 10px 0px 0px",
		boxShadow: Elevation.ONE,
		margin: "10px 10px",
		borderRadius: "5px",
		transition: "ease 0.3s",
		cursor: "not-allowed",
		backgroundColor: Colors.WHITE,
	},
}));

function renderIcon(extension) {
	let path = mdiFileQuestionOutline;
	switch (extension) {
		case "c":
			path = mdiLanguageC;
			break;
		case "cpp":
			path = mdiLanguageCpp;
			break;
		case "cs":
			path = mdiLanguageCsharp;
			break;
		case "go":
			path = mdiLanguageGo;
			break;
		case "ts":
			path = mdiLanguageTypescript;
			break;
		case "java":
			path = mdiLanguageJava;
			break;
		case "rb":
			path = mdiLanguageRuby;
			break;
		case "xml":
			path = mdiLanguageXaml;
			break;
		case "md":
			path = mdiLanguageMarkdown;
			break;
		case "kt":
		case "kts":
		case "ktm":
			path = mdiLanguageKotlin;
			break;
		case "php":
			path = mdiLanguagePhp;
			break;
		case "hs":
			path = mdiLanguageHaskell;
			break;
		case "r":
			path = mdiLanguageR;
			break;

		case "svg":
			path = mdiSvg;
			break;
		case "png":
		case "ico":
		case "jpg":
		case "jpeg":
			path = mdiImageOutline;
			break;
		case "json":
			path = mdiCodeJson;
			break;
		case "pdf":
			path = mdiFilePdfOutline;
			break;
		case "txt":
			path = mdiFileDocumentOutline;
			break;
		case "xlsx":
		case "xls":
			path = mdiMicrosoftExcel;
			break;
		case "docx":
		case "doc":
			path = mdiMicrosoftWord;
			break;
		case "pptx":
		case "ppt":
			path = mdiMicrosoftPowerpoint;
			break;
		case "mp4":
			break;
		case "js":
			path = mdiLanguageJavascript;
			break;
		case "py":
			path = mdiLanguagePython;
			break;
		case "html":
			path = mdiLanguageHtml5;
			break;
		case "zip":
			path = mdiFolderZipOutline;
			break;
		case "swift":
			path = mdiLanguageSwift;
			break;
		case "css":
			path = mdiLanguageCss3;
			break;
		case "gif":
			path = mdiGif;
			break;
		default:
			path = mdiFileQuestionOutline;
			break;
	}
	return <Icon path={path} size={"42px"} style={{ marginTop: "5px", opacity: 0.75 }} />;
}

export default function FileListItem({ file, ...others }) {
	const { name, type, key, ext, size, signedUrl } = file;
	const windowWidth = useWindowWidth();
	const cls = useStyles();
	const { code } = useParams();
	const { mutateAsync: removeFile } = useRemoveFile(code);
	const { toggleSelect, isSelected } = useContext(SelectedFilesContext);

	async function download() {
		if (isMobile) {
			window.open(signedUrl, "_blank");
		} else {
			try {
				const response = await axios.get(signedUrl, { responseType: "blob" });
				const { data } = response;
				await saveBlob(data, name);
				await axios.patch(`${BASE_API_URL}/api/v4/spaces/${code}/history`, {
					action: "DOWNLOAD_FILE",
					payload: key,
				});
				console.log("Succesfully downloaded ", name);
			} catch (error) {
				console.error(error);
			}
		}
	}

	async function remove() {
		try {
			await removeFile(key);
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<div className={cls.root} style={{ backgroundColor: isSelected(key) ? "#DDE8F8" : Colors.WHITE }}>
			<div className={cls.icon} onClick={() => toggleSelect(key)}>
				<Center>{renderIcon(ext)}</Center>
			</div>
			<div style={{ marginTop: "10px", minWidth: 0 }} className={cls.text} onClick={() => toggleSelect(key)}>
				<p
					style={{
						margin: 0,
						fontWeight: 500,
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis",
					}}
				>
					{name}
				</p>
				<p style={{ margin: 0, opacity: 0.7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
					{!isNaN(size / 1000)
						? size > 1000000
							? `${(size / (1024 * 1024)).toFixed(1)} MB`
							: `${(size / 1024).toFixed(1)} KB`
						: ""}
				</p>
			</div>
			<div className={cls.remove}>
				<Center>
					{windowWidth > 600 ? (
						<GButton text="Remove" variant="primary" onClick={remove} debounce={10} />
					) : (
						<GIconButton onClick={remove} variant="primary" debounce={10}>
							<DeleteIcon />
						</GIconButton>
					)}
				</Center>
			</div>
			<div className={cls.download}>
				<Center>
					{windowWidth > 600 ? (
						<GButton text="Download" onClick={download} variant="primary" debounce={2} />
					) : (
						<GIconButton onClick={download} variant="primary" debounce={2}>
							{isMobile ? <OpenInBrowserIcon /> : <CloudDownloadIcon />}
						</GIconButton>
					)}
				</Center>
			</div>
		</div>
	);
}
