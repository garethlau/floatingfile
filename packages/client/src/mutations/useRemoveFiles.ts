import { useMutation, useQueryClient } from "react-query";
import { BASE_API_URL } from "../env";
import axios from "axios";
import { File } from "@floatingfile/types";

export default function useRemoveFiles(code: string) {
  const queryClient = useQueryClient();
  function mutate(keysToRemove: string[]) {
    return new Promise((resolve, reject) => {
      axios
        .delete(
          `${BASE_API_URL}/api/v5/spaces/${code}/files?toRemove=${JSON.stringify(
            keysToRemove
          )}`
        )
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  const queryKey = ["space", code, "files"];

  async function onMutate(keysToRemove: string[]) {
    await queryClient.cancelQueries(queryKey);

    const snapshot = queryClient.getQueryData(queryKey);

    queryClient.setQueryData<Array<File>>(queryKey, (prev = []) => {
      let remainingFiles = prev.filter(
        (file) => !keysToRemove.includes(file.key)
      );
      return remainingFiles;
    });

    return { snapshot };
  }

  function onError(_0: any, _1: any, context: any) {
    queryClient.setQueryData(queryKey, context.snapshot);
  }

  function onSettled() {
    queryClient.invalidateQueries(queryKey);
    queryClient.invalidateQueries(["space", code]);
  }

  const config = {
    onMutate,
    onError,
    onSettled,
  };

  return useMutation(mutate, config);
}
