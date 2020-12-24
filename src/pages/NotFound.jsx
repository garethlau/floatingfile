import React from "react";
import Center from "../components/Center";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function NotFound() {
	useDocumentTitle("floatingfile");
	return (
		<div style={{ width: "100vw", height: "100vh" }}>
			<Center>
				<p>This page does not exist.</p>
			</Center>
		</div>
	);
}
