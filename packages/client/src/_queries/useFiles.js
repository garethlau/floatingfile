import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API_URL } from "../env";

export default function useFiles(code) {
	const queryKey = ["space", code, "files"];
	function query() {
		return new Promise((resolve, reject) => {
			axios
				.get(`${BASE_API_URL}/api/v4/spaces/${code}/files`)
				.then((response) => {
					const { files } = response.data;
					resolve(files);
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	const config = {
		enabled: !!code,
	};

	return useQuery(queryKey, query, config);
}
