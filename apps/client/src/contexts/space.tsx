import React, { createContext, useContext, useState } from "react";
import axios, { CancelToken } from "axios";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "react-query";
import { WrappedFile } from "../interfaces";
import { USERNAME_STORAGE_KEY } from "../env";
import rpcClient from "../lib/rpc";
import { saveAs } from "file-saver";
import { FindSpaceFn } from "@floatingfile/types";

interface ContextType {
  code: string;
  space?: Awaited<ReturnType<FindSpaceFn>>;
  isLoading: boolean;
  status: UseQueryResult["status"];
  refetch: UseQueryResult["refetch"];
  destroy: () => void;
  removeFile: UseMutationResult<void, unknown, string, unknown>["mutateAsync"];
  removeFiles: UseMutationResult<
    void,
    unknown,
    string[],
    unknown
  >["mutateAsync"];
  uploadFile: (
    wrappedFile: WrappedFile,
    options?: {
      cancelToken?: CancelToken;
      onPreUpload?: () => void;
      onUpload?: () => void;
      onPostUpload?: () => void;
      onUploadProgress?: ((progressEvent: any) => void) | undefined;
    }
  ) => Promise<void>;
  downloadFile: (
    id: string,
    filename: string,
    options?: {
      cancelToken?: CancelToken;
      onPreDownload?: () => void;
      onDownload?: () => void;
      onPostDownload?: () => void;
      onDownloadProgress?: ((progressEvent: any) => void) | undefined;
    }
  ) => Promise<void>;
  zipFiles: (ids: string[]) => Promise<void>;
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  toggleSelect: (key: string) => void;
  select: (key: string) => void;
  unselect: (key: string) => void;
  clear: () => void;
  isSelected: (key: string) => boolean;
}

export const SpaceContext = createContext<ContextType | undefined>(undefined);

export const SpaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const code = window.location.href.split("/")[4];
  const queryKey = ["space", code];
  const queryClient = useQueryClient();

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
      onPreDownload?: () => void;
      onDownload?: () => void;
      onPostDownload?: () => void;
      onDownloadProgress?: ((progressEvent: any) => void) | undefined;
    }
  ) {
    const {
      cancelToken,
      onPreDownload,
      onDownload,
      onPostDownload,
      onDownloadProgress,
    } = options || {};

    const { signedUrl } = await rpcClient.invoke("preDownload", { id });
    if (typeof onPreDownload === "function") onPreDownload();

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

    await rpcClient.invoke("postDownload", {
      code,
      username: localStorage.getItem(USERNAME_STORAGE_KEY)!,
      name: filename,
    });
    if (typeof onPostDownload === "function") onPostDownload();
  }

  async function uploadFile(
    wrappedFile: WrappedFile,
    options?: {
      cancelToken?: CancelToken;
      onPreUpload?: () => void;
      onUpload?: () => void;
      onPostUpload?: () => void;
      onUploadProgress?: ((progressEvent: any) => void) | undefined;
    }
  ) {
    const {
      cancelToken,
      onPreUpload,
      onUpload,
      onPostUpload,
      onUploadProgress,
    } = options || {};
    const { ext, file } = wrappedFile;
    const response = await rpcClient.invoke("preUpload", {
      code,
      size: file.size.toString(),
    });
    if (!response) {
      throw new Error("Storage capacity exceeded.");
    }

    const { signedUrl, key } = response;
    if (typeof onPreUpload === "function") onPreUpload();
    await axios.put(signedUrl, file, {
      cancelToken,
      onUploadProgress,
    });
    if (typeof onUpload === "function") onUpload();

    await rpcClient.invoke("postUpload", {
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
    if (typeof onPostUpload === "function") onPostUpload();
  }

  const [values, setValues] = useState<string[]>([]);

  function select(key: string) {
    if (!isSelected(key)) {
      setValues((prev) => [...prev, key]);
    }
  }

  function unselect(key: string) {
    setValues((prev) => {
      const newValues = prev.filter((val) => val !== key);
      return newValues;
    });
  }

  function toggleSelect(key: string) {
    // Item is already selected
    if (isSelected(key)) {
      unselect(key);
    } else {
      select(key);
    }
  }

  function clear() {
    setValues([]);
  }

  function isSelected(key: string) {
    return values.includes(key);
  }

  return (
    <SpaceContext.Provider
      value={{
        code,
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
        selected: values,
        setSelected: setValues,
        toggleSelect,
        select,
        unselect,
        clear,
        isSelected,
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
};

export const useSpace = () => {
  const context = useContext(SpaceContext);
  if (context === undefined) {
    throw new Error("useSpace must be used within a SpaceProvider");
  }
  return context;
};
