import { useMutation } from "react-query";
import axios from "axios";
import { BASE_API_URL } from "../env";

export default function useUploadFiles({ code, onSuccess }) {
	return useMutation(
		({ files, config }) => {
			let formData = new FormData();
			Array.from(files).forEach((file) => formData.append("files", file));
			return axios.post(`${BASE_API_URL}/api/v3/space/${code}/files`, formData, config);
		},
		{
			onSuccess,
		}
	);
}
