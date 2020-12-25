import React from "react";
import Button from "./Button";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";

export default function FileUploadBtn({ handleFiles }) {
	function handleClick(event) {
		document.getElementById("hiddenFileInput").click();
	}

	function handleChange(event) {
		const uploadedFiles = event.target.files;
		handleFiles(uploadedFiles);
	}

	return (
		<React.Fragment>
			<Button
				onClick={handleClick}
				fullWidth
				variant="success"
				startIcon={<CloudUploadIcon />}
				overrideStyles={{ height: "42px" }}
			>
				Upload
			</Button>
			<input onChange={handleChange} multiple type="file" id="hiddenFileInput" style={{ display: "none" }} />
		</React.Fragment>
	);
}
