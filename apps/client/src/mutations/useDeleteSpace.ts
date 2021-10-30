import { useMutation } from "react-query";
import axios from "axios";

export default function useDeleteSpace(code: string) {
  return useMutation(() => {
    return axios.delete(`/api/v5/spaces/${code}`);
  });
}
