import { useMutation } from "react-query";
import { BASE_API_URL } from "../env";
import axios from "axios";

export default function useCreateSpace() {
	function mutate() {
		return new Promise((resolve, reject) => {
			axios
				.post(`${BASE_API_URL}/api/v4/spaces`)
				.then((response) => {
					const { space } = response.data;
					resolve(space);
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	const config = {};

	return useMutation(mutate, config);
}
