import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
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
  // ID used soley by the client to keep track of uploads
  id: string;
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
        const { file, id, ext } = wrappedFile;

        if (!sourceRef.current) {
          sourceRef.current = axios.CancelToken.source();
        }

        try {
          await new Promise((resolve, reject) => {
            // Generate a signed URL to upload file directly from client
            // The file meta data is provided to ensure that the space has capacity to upload the file
            axios
              .post(`${BASE_API_URL}/api/v5/signed-urls`, {
                file,
                code,
              })
              .then((response) => {
                const { signedUrl, key } = response.data;
                setCurrentUpload(id);

                // Upload the file using the signed URL. The signed URL generated is for the returned key.
                axios
                  .put(signedUrl, file, {
                    onUploadProgress: (event) => {
                      // Set upload progress for current file
                      updateProgress(id, event.loaded, event.total);
                    },
                    cancelToken: sourceRef.current?.token,
                  })
                  .then(() => {
                    setCurrentUpload("");

                    // Create data object which is used by the server to create the file object.
                    const data = {
                      size: file.size,
                      name: file.name,
                      type: file.type,
                      ext,
                      key,
                    };
                    // Adds a file object to the file array of the space
                    axios
                      .patch(
                        `${BASE_API_URL}/api/v5/spaces/${code}/files`,
                        data
                      )
                      .then(resolve)
                      .catch(reject);
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
          complete(id);
          dequeue();
        }
      }
    })();
  }, [pending]);

  /**
   * This function adds multiple files to the upload queue. It generates a
   * unique ID for the file and parses the file extension to create a
   * WrappedFile object.
   * @param files Array of files to add to the upload queue.
   */
  function enqueueMany(files: File[]) {
    // Add the files to the queue
    const extendedFiles = files.map((file) => {
      const id = uuidv4();
      const ext = file.name.split(".")[file.name.split(".").length - 1];

      const wrappedFile: WrappedFile = {
        id,
        ext,
        file,
      };
      return wrappedFile;
    });

    setPending((prev) => [...prev, ...extendedFiles]);
  }

  /**
   * Removes and returns the first file in the upload queue
   * @returns File at the front of the queue
   */
  function dequeue(): WrappedFile {
    const top = pending[0];
    setPending((prev) => prev.slice(1));
    return top;
  }

  /**
   *
   * @returns Peek the first file in the queue
   */
  function peek(): WrappedFile {
    return pending[0];
  }

  /**
   *
   * @returns Number of files in the queue to be uploaded
   */
  function size(): number {
    return pending.length;
  }

  /**
   * This function sets the uploaded value of a file
   * @param id ID of the file to update the upload progress for
   * @param loaded Uploaded data
   * @param total File size
   */
  function updateProgress(id: string, loaded: number, total: number): void {
    setProgress((prev) => ({
      ...prev,
      [id]: loaded / total,
    }));
  }

  /**
   *
   * @param id ID of file to get upload progress for
   * @returns Decminal value of upload progress (between 0 and 1)
   */
  function getProgress(id: string): number | null {
    return progress[id] || null;
  }

  /**
   *
   * @param id ID of file that has successfully been uploaded. Removes the upload object for the file.
   */
  function complete(id: string): void {
    setProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[id];
      return newProgress;
    });
  }

  /**
   *
   * @param id ID of file to cancel upload
   */
  function cancel(id: string): void {
    console.log("Cancelling upload ", id);
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

export const useUploadService = () => {
  const context = useContext(UploadServiceContext);
  if (context === undefined) {
    throw new Error(
      "useUploadService must be used within a UploadServiceProvider"
    );
  }
  return context;
};
