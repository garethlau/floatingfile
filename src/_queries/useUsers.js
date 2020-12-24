import { useQuery } from "react-query";
import { BASE_API_URL } from "../env";
import axios from "axios";

export default function useUsers(code) {
	const queryKey = ["space", code, "users"];
	function query() {
		return new Promise((resolve, reject) => {
			axios
				.get(`${BASE_API_URL}/api/v4/spaces/${code}/users`)
				.then((response) => {
					const { users } = response.data;
					resolve(users);
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	const config = { enabled: !!code, initialData: [] };

	return useQuery(queryKey, query, config);
}
