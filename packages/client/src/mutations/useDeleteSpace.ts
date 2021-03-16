import { useMutation } from "react-query";
import { BASE_API_URL } from "../env";
import axios from "axios";

export default function useDeleteSpace(code: string) {
  return useMutation(() => {
    return axios.delete(`${BASE_API_URL}/api/v5/spaces/${code}`);
  });
}
