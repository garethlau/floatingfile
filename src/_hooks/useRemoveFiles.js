import { useMutation } from "react-query";
import axios from "axios";
import { BASE_API_URL } from "../env";

export default function useRemoveFiles({ code, onSuccess }) {
	return useMutation(
		(ids) => {
			return axios.delete(`${BASE_API_URL}/api/v3/space/${code}/files?files=${JSON.stringify(ids)}`);
		},
		{
			onSuccess,
		}
	);
}
