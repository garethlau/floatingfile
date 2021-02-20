import React from "react";
import Button from "./Button";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";

interface Event<T = EventTarget> {
  target: T;
}

const FileUploadBtn: React.FC<{ handleFiles: any }> = ({ handleFiles }) => {
  function handleClick() {
    const elem = document.getElementById("hiddenFileInput");
    if (elem) {
      elem.click();
    }
  }

  function handleChange(event: Event<HTMLInputElement>) {
    const uploadedFiles = event.target?.files || [];
    handleFiles(Array.from(uploadedFiles));
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
      <input
        onChange={handleChange}
        multiple
        type="file"
        id="hiddenFileInput"
        style={{ display: "none" }}
      />
    </React.Fragment>
  );
};

export default FileUploadBtn;
