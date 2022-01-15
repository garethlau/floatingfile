import axios, { CancelToken } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { WrappedFile } from "../interfaces";
import { USERNAME_STORAGE_KEY } from "../env";
import rpcClient from "../lib/rpc";
import { saveAs } from "file-saver";

export default function useSpace(code: string) {
  const queryClient = useQueryClient();
  const queryKey = ["space", code];

  const {
    data: space,
    isLoading,
    status,
    refetch,
  } = useQuery(queryKey, () => rpcClient.invoke("findSpace", { code }), {
    enabled: !!code,
    refetchOnWindowFocus: true,
    staleTime: 60 * 1000,
  });

  const { mutateAsync: removeFile } = useMutation(
    (id: string) =>
      rpcClient.invoke("removeFile", {
        username: localStorage.getItem(USERNAME_STORAGE_KEY)!,
        id,
      }),
    {
      mutationKey: queryKey,
      onMutate: async (id) => {
        await queryClient.cancelQueries(queryKey);
        const snapshopt = queryClient.getQueryData(queryKey);
        queryClient.setQueryData<{ files: { id: string }[] } | undefined>(
          queryKey,
          (prev) => {
            if (!prev) return prev;
            const updatedSpace = prev;
            const newFiles = updatedSpace.files.filter(
              (file) => file.id !== id
            );
            updatedSpace.files = newFiles;
            return prev;
          }
        );
        return snapshopt;
      },
      onError: (_0, _1, context) => {
        queryClient.setQueryData(queryKey, context);
      },
      onSettled: () => {
        queryClient.invalidateQueries(queryKey);
      },
    }
  );
  const { mutateAsync: removeFiles } = useMutation(
    (ids: string[]) =>
      rpcClient.invoke("removeFiles", {
        username: localStorage.getItem(USERNAME_STORAGE_KEY)!,
        ids,
      }),
    {
      mutationKey: queryKey,
      onMutate: async (ids) => {
        await queryClient.cancelQueries(queryKey);
        const snapshot = queryClient.getQueryData(queryKey);
        queryClient.setQueryData<{ files: { id: string }[] } | undefined>(
          queryKey,
          (prev) => {
            if (!prev) return prev;
            const updatedSpace = prev;
            const newFiles = updatedSpace.files.filter(
              (file) => !ids.includes(file.id)
            );
            updatedSpace.files = newFiles;
            return prev;
          }
        );
        return snapshot;
      },
      onError: (_0, _1, context) => {
        queryClient.setQueryData(queryKey, context);
      },
      onSettled: () => {
        queryClient.invalidateQueries(queryKey);
      },
    }
  );

  function destroy() {
    return rpcClient.invoke("destroySpace", { code });
  }

  async function zipFiles(ids: string[]) {
    const response = await axios.get(`/api/zip?ids=${JSON.stringify(ids)}`, {
      responseType: "blob",
    });
    const folderName = response.headers["content-disposition"]
      .split("=")[1]
      .replace(/"/g, "");
    const { data } = response;
    const blob = new Blob([data], { type: data.type });
    saveAs(blob, folderName);
  }

  async function downloadFile(
    id: string,
    filename: string,
    options?: {
      cancelToken?: CancelToken;
      onPredownload?: () => void;
      onDownload?: () => void;
      onPostdownload?: () => void;
      onDownloadProgress?: ((progressEvent: any) => void) | undefined;
    }
  ) {
    const {
      cancelToken,
      onPredownload,
      onDownload,
      onPostdownload,
      onDownloadProgress,
    } = options || {};

    const { signedUrl } = await rpcClient.invoke("predownload", { id });
    if (typeof onPredownload === "function") onPredownload();

    const response = await axios.get(signedUrl, {
      responseType: "blob",
      onDownloadProgress,
      cancelToken,
    });

    const { data } = response;
    const blob = new Blob([data], { type: data.type });
    // macos: chrome, safari
    // android: chrome
    // ios: safari
    saveAs(blob, filename);

    if (typeof onDownload === "function") onDownload();

    await rpcClient.invoke("postdownload", {
      code,
      username: localStorage.getItem(USERNAME_STORAGE_KEY)!,
      name: filename,
    });
    if (typeof onPostdownload === "function") onPostdownload();
  }

  async function uploadFile(
    wrappedFile: WrappedFile,
    options?: {
      cancelToken?: CancelToken;
      onPreupload?: () => void;
      onUpload?: () => void;
      onPostupload?: () => void;
      onUploadProgress?: ((progressEvent: any) => void) | undefined;
    }
  ) {
    const {
      cancelToken,
      onPreupload,
      onUpload,
      onPostupload,
      onUploadProgress,
    } = options || {};
    const { ext, file } = wrappedFile;
    const response = await rpcClient.invoke("preupload", {
      code,
      size: file.size.toString(),
    });
    if (!response) {
      throw new Error("Storage capacity exceeded.");
    }

    const { signedUrl, key } = response;
    if (typeof onPreupload === "function") onPreupload();
    await axios.put(signedUrl, file, {
      cancelToken,
      onUploadProgress,
    });
    if (typeof onUpload === "function") onUpload();

    await rpcClient.invoke("postupload", {
      code,
      username: localStorage.getItem(USERNAME_STORAGE_KEY)!,
      file: {
        size: file.size.toString(),
        name: file.name,
        type: file.type,
        ext,
        key,
      },
    });
    if (typeof onPostupload === "function") onPostupload();
  }

  return {
    space,
    isLoading,
    status,
    refetch,
    destroy,
    removeFile,
    removeFiles,
    uploadFile,
    downloadFile,
    zipFiles,
  };
}
