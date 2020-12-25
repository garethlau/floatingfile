import React, { useContext, useState, useEffect } from "react";
import { UploadQueueContext } from "../_contexts/uploadQueue";
import { makeStyles } from "@material-ui/core/styles";
import { formatFileSize } from "../_utils";
import { Colors } from "../constants";
import MinimizeIcon from "@material-ui/icons/Minimize";
import IconButton from "@material-ui/core/IconButton";
import LinearProgress from "@material-ui/core/LinearProgress";
import { isMobile } from "react-device-detect";

const useStyles = makeStyles((theme) => ({
	root: {
		width: "300px",
		height: "400px",
		backgroundColor: "white",
		bottom: "0",
		right: "30px",
		position: "fixed",
		boxShadow: theme.shadows[10],
		borderRadius: "5px",
		zIndex: 5,
		transition: "height ease 0.2s",
	},
	minimized: {
		height: "50px",
	},
	header: {
		position: "relative",
		top: 0,
		backgroundColor: theme.palette.primary.main,
		padding: "10px",
		color: theme.palette.common.white,
		borderRadius: "5px 5px 0 0",
		height: "30px",
	},
	container: {
		height: "350px",
		overflowY: "auto",
	},
	fileCard: {
		backgroundColor: Colors.LIGHT_SHADE,
		borderRadius: "5px",
		padding: "5px",
		margin: "15px 10px",
		boxShadow: theme.shadows[3],
		"& > p": {
			margin: 0,
			textOverflow: "ellipsis",
			maxWidth: "270px",
			display: "block",
			overflow: "hidden",
			whiteSpace: "nowrap",
		},
	},
}));

export default function UploadQueue() {
	const cls = useStyles();
	const uploadQueue = useContext(UploadQueueContext);
	const [open, setOpen] = useState(false);
	const [minimized, setMinimized] = useState(false);

	useEffect(() => {
		if (uploadQueue.size() > 0) {
			setOpen(true);
		} else {
			setOpen(false);
		}
	}, [uploadQueue]);

	function toggleMinimized() {
		setMinimized(!minimized);
	}

	if (!open || isMobile) {
		return null;
	}
	return (
		<div className={`${cls.root} ${minimized ? cls.minimized : ""}`}>
			<div className={cls.header}>
				<h2 style={{ margin: 0, float: "left" }}>Upload Queue</h2>
				<IconButton onClick={toggleMinimized} style={{ color: "white", float: "right", padding: 0 }} size="large">
					<MinimizeIcon />
				</IconButton>
			</div>
			<div className={cls.container}>
				{uploadQueue.values?.map((file) => (
					<div key={file.key} className={cls.fileCard}>
						<p> {file.name}</p>
						<p>{formatFileSize(file.size)}</p>
						<LinearProgress variant="determinate" value={(uploadQueue.progress[file.key] || 0) * 100} />
					</div>
				))}
			</div>
		</div>
	);
}
