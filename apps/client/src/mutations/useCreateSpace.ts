import { useMutation } from "react-query";
import { BASE_API_URL } from "../env";
import axios from "axios";
import { Space } from "@floatingfile/common";

export default function useCreateSpace() {
  function mutate(): Promise<Space> {
    return axios
      .post(`${BASE_API_URL}/api/v5/spaces`)
      .then((response) => response.data.space);
  }

  return useMutation(mutate);
}
