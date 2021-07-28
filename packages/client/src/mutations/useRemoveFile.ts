import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { BASE_API_URL } from "../env";
import { Space } from "@floatingfile/common";

export default function useRemoveFile(code: string) {
  const queryClient = useQueryClient();
  const queryKey = ["space", code];

  return useMutation(
    (key: string) =>
      axios.delete(`${BASE_API_URL}/api/v5/spaces/${code}/files/${key}`),
    {
      mutationKey: queryKey,
      onMutate: async (key: string) => {
        await queryClient.cancelQueries(queryKey);
        const snapshot = queryClient.getQueryData<Space>(queryKey);
        queryClient.setQueryData<Space | undefined>(queryKey, (prev) => {
          if (!prev) return prev;
          const newFiles = prev.files.filter((file) => file.key !== key);
          prev.files = newFiles;
          return prev;
        });
        return snapshot;
      },
      onError: (_0, _1, context) => {
        queryClient.setQueryData<Space | undefined>(queryKey, context);
      },
      onSettled: () => {
        queryClient.invalidateQueries(queryKey);
      },
    }
  );
}
