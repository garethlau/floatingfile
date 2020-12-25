import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { BASE_API_URL } from "../env";

export default function useUploadFile(code) {
	const queryClient = useQueryClient();
	const queryKey = ["space", code, "files"];

	function mutate({ file, onUploadProgress }) {
		return new Promise((resolve, reject) => {
			const data = {
				key: file.key,
				size: file.size,
				name: file.name,
				type: file.type,
				ext: file.ext,
			};
			axios
				.post(`${BASE_API_URL}/api/v4/signed-urls`, { file, code })
				.then((response) => {
					const { signedUrl } = response.data;
					axios
						.put(signedUrl, file, { onUploadProgress })
						.then((response) => {
							axios
								.patch(`${BASE_API_URL}/api/v4/spaces/${code}/file`, data)
								.then((response) => {
									resolve();
								})
								.catch((error) => {
									reject(error);
								});
						})
						.catch((error) => {
							reject(error);
						});
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	function onSettled() {
		queryClient.invalidateQueries(queryKey);
	}

	const config = {
		onSettled,
	};

	return useMutation(mutate, config);
}
