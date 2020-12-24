import { useState } from "react";

const useFormInput = (initialValue) => {
	const [value, setValue] = useState(initialValue);
	const [hasError, setHasError] = useState(false);
	const [helperText, setHelperText] = useState("");

	function setError(msg) {
		setHasError(true);
		setHelperText(msg);
	}

	function clearError() {
		setHasError(false);
		setHelperText("");
	}

	function handleChange(e) {
		clearError();
		setValue(e.target.value);
	}

	function clear() {
		setValue("");
	}
	return {
		value: value,
		onChange: handleChange,
		clear: clear,
		hasError: hasError,
		helperText: helperText,
		setError: setError,
		clearError: clearError,
	};
};

export default useFormInput;
