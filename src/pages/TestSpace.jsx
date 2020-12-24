import React, { useState, useEffect } from "react";
import useSpace from "../hooks/useSpace";

export default function TestSpace() {
	const [code, setCode] = useState("");
	useEffect(() => {
		let pathArr = window.location.href.split("/");
		setCode(pathArr[pathArr.length - 1]);
	}, []);
	const { data: space, status: spaceStatus, refetch: fetchSpace } = useSpace(
		window.location.href.split("/")[window.location.href.split("/").length - 1]
	);

	return (
		<div>
			{spaceStatus}
			{spaceStatus === "loading"
				? "Loading"
				: spaceStatus === "error"
				? "Error"
				: spaceStatus === "success"
				? "Success"
				: space}
		</div>
	);
}
