import React, { createContext, useState, useRef, useEffect } from "react";
import axios, { CancelToken, CancelTokenSource } from "axios";
import { BASE_API_URL } from "../env";
import { v4 as uuidv4 } from "uuid";

interface Context {
  enqueueMany: (files: File[]) => void;
  peek: () => WrappedFile | null;
  size: () => number;
  updateProgress: (key: string, loaded: number, total: number) => void;
  getProgress: (key: string) => number | null;
  dequeue: () => WrappedFile | null;
  pending: WrappedFile[];
  complete: (key: string) => void;
  cancel: (key: string) => void;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  currentUpload: string;
}

export interface WrappedFile {
  file: File;
  key: string;
  ext: string;
}

export const UploadServiceContext = createContext<Context>({
  enqueueMany: (files: File[]) => {},
  peek: () => null,
  size: () => 0,
  updateProgress: () => {},
  getProgress: (key: string) => null,
  dequeue: () => null,
  pending: [],
  complete: () => {},
  cancel: () => {},
  setCode: () => {},
  currentUpload: "",
});

export const UploadServiceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pending, setPending] = useState<WrappedFile[]>([]);
  const [code, setCode] = useState<string>("");
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [currentUpload, setCurrentUpload] = useState<string>("");

  const sourceRef = useRef<CancelTokenSource | null>(null);

  useEffect(() => {
    (async function () {
      if (size() > 0) {
        const wrappedFile = peek();
        const { file, key, ext } = wrappedFile;

        if (!sourceRef.current) {
          sourceRef.current = axios.CancelToken.source();
        }

        try {
          await new Promise((resolve, reject) => {
            const data = {
              key: key,
              size: file.size,
              name: file.name,
              type: file.type,
              ext: ext,
            };
            axios
              .post(`${BASE_API_URL}/api/v4/signed-urls`, {
                file: { ...file, key },
                code,
              })
              .then((response) => {
                const { signedUrl } = response.data;
                setCurrentUpload(key);
                axios
                  .put(signedUrl, file, {
                    onUploadProgress: (event) => {
                      updateProgress(key, event.loaded, event.total);
                    },
                    cancelToken: sourceRef.current?.token,
                  })
                  .then((response) => {
                    setCurrentUpload("");
                    axios
                      .patch(`${BASE_API_URL}/api/v4/spaces/${code}/file`, data)
                      .then((response) => {
                        resolve(response);
                      })
                      .catch((error) => {
                        reject(error);
                      });
                  })
                  .catch((error) => {
                    reject(error);
                  });
              })
              .catch((error) => {
                reject(error);
              });
          });
        } catch (error) {
          if (axios.isCancel(error)) {
            // Cleanup logic
            console.log(error.message);
            sourceRef.current = null;
          } else {
            console.log(error);
          }
        } finally {
          complete(key);
          console.log("Done ", file.name);
          dequeue();
        }
      }
    })();
  }, [pending]);

  function enqueueMany(files: File[]) {
    // Add the files to the queue
    const extendedFiles = files.map((file) => {
      const key = uuidv4();
      const ext = file.name.split(".")[file.name.split(".").length - 1];

      const wrappedFile: WrappedFile = {
        key,
        ext,
        file,
      };
      return wrappedFile;
    });

    setPending((prev) => [...prev, ...extendedFiles]);
  }

  function dequeue(): WrappedFile {
    const top = pending[0];
    setPending((prev) => prev.slice(1));
    return top;
  }

  function peek(): WrappedFile {
    return pending[0];
  }

  function size(): number {
    return pending.length;
  }

  function updateProgress(key: string, loaded: number, total: number): void {
    setProgress((prev) => ({
      ...prev,
      [key]: loaded / total,
    }));
  }

  function getProgress(key: string): number | null {
    return progress[key] || null;
  }

  function complete(key: string): void {
    setProgress((prev) => {
      const newProgress = Object.assign({}, prev);
      delete newProgress[key];
      return newProgress;
    });
  }

  function cancel(key: string): void {
    console.log("Cancelling upload ", key);
    if (sourceRef.current) {
      sourceRef.current.cancel("Operation cancelled");
    }
  }

  return (
    <UploadServiceContext.Provider
      value={{
        enqueueMany,
        peek,
        size,
        updateProgress,
        getProgress,
        dequeue,
        pending,
        complete,
        cancel,
        setCode,
        currentUpload,
      }}
    >
      {children}
    </UploadServiceContext.Provider>
  );
};
