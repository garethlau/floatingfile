import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { Space } from "@floatingfile/common";

export default function useRemoveFiles(code: string) {
  const queryClient = useQueryClient();
  const queryKey = ["space", code];

  return useMutation(
    (keysToRemove: string[]) =>
      axios.delete(
        `/api/v5/spaces/${code}/files?toRemove=${JSON.stringify(keysToRemove)}`
      ),
    {
      onMutate: async (toRemove: string[]) => {
        await queryClient.cancelQueries(queryKey);
        const snapshot = queryClient.getQueryData<Space>(queryKey);
        queryClient.setQueryData<Space | undefined>(queryKey, (prev) => {
          if (!prev) return prev;
          const remainingFiles = prev.files.filter(
            (file) => !toRemove.includes(file.key)
          );
          // eslint-disable-next-line
          prev.files = remainingFiles;
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
