import { useMutation } from "react-query";
import axios from "axios";
import { Space } from "@floatingfile/common";

export default function useCreateSpace() {
  function mutate(): Promise<Space> {
    return axios.post("/api/v5/spaces").then((response) => response.data.space);
  }

  return useMutation(mutate);
}
