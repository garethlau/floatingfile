import { useMutation, useQueryClient } from "react-query";
import axios, { AxiosResponse } from "axios";
import { BASE_API_URL } from "../env";
import { File } from "@floatingfile/types";

export default function useRemoveFile(code: string) {
  const queryClient = useQueryClient();
  const queryKey = ["space", code, "files"];

  function mutate(key: string): Promise<AxiosResponse> {
    return axios.delete(`${BASE_API_URL}/api/v5/spaces/${code}/files/${key}`);
  }

  async function onMutate(key: string) {
    await queryClient.cancelQueries(queryKey);

    const snapshot = queryClient.getQueryData(queryKey);

    queryClient.setQueryData<Array<File>>(queryKey, (prev = []) => {
      let newFiles = prev.filter((file) => file.key !== key);
      return newFiles;
    });

    return { snapshot };
  }

  function onError(_0: any, _1: any, context: any) {
    queryClient.setQueryData(queryKey, context.snapshot);
  }

  function onSettled() {
    queryClient.invalidateQueries(queryKey);
  }
  const config = {
    onMutate,
    onError,
    onSettled,
  };
  return useMutation(mutate, config);
}
