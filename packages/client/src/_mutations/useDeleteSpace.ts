import { useMutation, useQueryClient } from "react-query";
import { BASE_API_URL } from "../env";
import axios from "axios";

export default function useDeleteSpace(code: string) {
  const queryClient = useQueryClient();
  const queryKey = ["space", code];

  function mutate(): Promise<void> {
    return axios.delete(`${BASE_API_URL}/api/v4/spaces/${code}`);
  }

  async function onMutate() {
    await queryClient.cancelQueries(queryKey);

    const snapshot = queryClient.getQueryData<Response>(queryKey);

    queryClient.setQueryData(queryKey, null);

    return { snapshot };
  }

  function onError(_0: any, _1: any, context: any) {
    queryClient.setQueryData<Response>(queryKey, context.snapshot);
  }

  function onSettled() {
    queryClient.cancelQueries(["space"]);
  }

  const config = {
    onMutate,
    onError,
    onSettled,
  };

  return useMutation(mutate, config);
}
