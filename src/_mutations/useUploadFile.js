import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { BASE_API_URL } from "../env";

export default function useUploadFile(code) {
	const queryClient = useQueryClient();
	const queryKey = ["space", code, "files"];

	function mutate(file) {
		return new Promise((resolvle, reject) => {
			const data = {
				key: file.key,
				size: file.size,
				name: file.name,
				type: file.type,
				ext: file.ext,
			};
			axios
				.patch(`${BASE_API_URL}/api/v4/spaces/${code}/file`, data)
				.then((response) => {
					const { signedUrl } = response.data;
					axios
						.put(signedUrl, file)
						.then((response) => {
							resolvle(response);
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

	async function onMutate(file) {
		await queryClient.cancelQueries(queryKey);

		const snapshot = queryClient.getQueryData(queryKey);

		const fileMeta = {
			key: file.key,
			size: file.size,
			name: file.name,
			type: file.type,
			ext: file.ext,
		};
		queryClient.setQueryData(queryKey, (prev) => [fileMeta, ...prev]);

		return { snapshot };
	}

	function onError(_0, _1, context) {
		queryClient.setQueryData(queryKey, context.snapshot);
	}

	function onSettled() {
		queryClient.invalidateQueries(queryKey);
	}

	const config = {
		onMutate,
		onError,
		onSettled,
	};

	return useMutation(mutate, config);
}
