import React, { createContext, useState } from "react";

export const UploadQueueContext = createContext();

export function UploadQueueProvider({ children }) {
	const [values, setValues] = useState([]);
	const [progress, setProgress] = useState({});

	function enqueueMany(files) {
		setValues((prev) => [...prev, ...files]);
	}

	function remove(key) {
		setValues((prev) => prev.filter((file) => file.key !== key));
	}

	function peek() {
		return values[0];
	}

	function size() {
		return values.length;
	}

	function updateProgress(key, loaded, total) {
		setProgress((prev) => ({
			...prev,
			[key]: loaded / total,
		}));
		console.log(progress);
	}

	function getProgress(key) {
		return progress[key] || null;
	}

	return (
		<UploadQueueContext.Provider
			value={{
				values,
				enqueueMany,
				remove,
				peek,
				size,
				updateProgress,
				getProgress,
				progress,
			}}
		>
			{children}
		</UploadQueueContext.Provider>
	);
}
