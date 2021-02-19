import { useMutation, useQueryClient } from "react-query";
import { BASE_API_URL } from "../env";
import axios from "axios";

export default function useRemoveFiles(code) {
	const queryClient = useQueryClient();
	function mutate(keysToRemove) {
		return new Promise((resolve, reject) => {
			axios
				.delete(`${BASE_API_URL}/api/v4/spaces/${code}/files?toRemove=${JSON.stringify(keysToRemove)}`)
				.then((response) => {
					resolve(response);
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	const queryKey = ["space", code, "files"];

	async function onMutate(keysToRemove) {
		await queryClient.cancelQueries(queryKey);

		const snapshot = queryClient.getQueryData(queryKey);

		queryClient.setQueryData(queryKey, (prev) => {
			let remainingFiles = prev.filter((file) => !keysToRemove.includes(file.key));
			return remainingFiles;
		});

		return { snapshot };
	}

	function onError(_0, _1, context) {
		queryClient.setQueryData(queryKey, context.snapshot);
	}

	function onSettled() {
		queryClient.invalidateQueries(queryKey);
		queryClient.invalidateQueries(["space", code]);
	}

	const config = {
		onMutate,
		onError,
		onSettled,
	};

	return useMutation(mutate, config);
}
