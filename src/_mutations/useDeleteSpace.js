import { useMutation, useQueryClient } from "react-query";
import { BASE_API_URL } from "../env";
import axios from "axios";

export default function useDeleteSpace(code) {
	const queryClient = useQueryClient();
	const queryKey = ["space", code];

	function mutate() {
		return new Promise((resolve, reject) => {
			axios
				.delete(`${BASE_API_URL}/api/v4/spaces/${code}`)
				.then((response) => {
					resolve();
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	async function onMutate() {
		await queryClient.cancelQueries(queryKey);

		const snapshot = queryClient.getQueryData(queryKey);

		queryClient.setQueryData(queryKey, null);

		return { snapshot };
	}

	function onError(_0, _1, context) {
		queryClient.setQueryData(queryKey, context.snapshot);
	}

	function onSettled() {
		queryClient.cancelQueries(["space"]);
	}

	const config = {
		onMutate,
		onError,
		onSettled,
	};

	return useMutation(mutate, config);
}
