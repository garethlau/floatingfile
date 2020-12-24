import React from "react";
import GButton from "./GButton";
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
		<>
			<GButton
				text="Upload"
				onClick={handleClick}
				fullWidth
				variant="success"
				startIcon={<CloudUploadIcon />}
				overrideStyles={{ height: "42px" }}
			/>
			<input onChange={handleChange} multiple type="file" id="hiddenFileInput" style={{ display: "none" }} />
		</>
	);
}
