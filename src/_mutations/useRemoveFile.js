import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { BASE_API_URL } from "../env";

export default function useRemoveFile(code) {
	const queryClient = useQueryClient();
	const queryKey = ["space", code, "files"];
	function mutate(key) {
		return new Promise((resolve, reject) => {
			axios
				.delete(`${BASE_API_URL}/api/v4/spaces/${code}/files/${key}`)
				.then((response) => {
					resolve(response);
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	async function onMutate(key) {
		await queryClient.cancelQueries(queryKey);

		const snapshot = queryClient.getQueryData(queryKey);

		queryClient.setQueryData(queryKey, (prev) => {
			let newFiles = prev.filter((file) => file.key !== key);
			return newFiles;
		});

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
