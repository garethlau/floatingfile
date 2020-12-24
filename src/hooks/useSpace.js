import { BASE_API_URL } from "../env";
import { useQuery } from "react-query";
import axios from "axios";

export const fetchSpace = (code) => {
	return new Promise((resolve, reject) => {
		axios
			.get(`${BASE_API_URL}/api/v3/space/${code}`)
			.then((response) => {
				resolve(response.data.space);
			})
			.catch((error) => {
				console.log(error);
				reject(error);
			});
	});
};

export default function useSpace(code) {
	let { data, refetch, status } = useQuery("space", () => fetchSpace(code), {
		refetchOnWindowFocus: true,
	});

	if (!data) {
		data = {
			files: [],
			history: [],
			users: [],
		};
	}

	return {
		data,
		refetch,
		status,
	};
}
