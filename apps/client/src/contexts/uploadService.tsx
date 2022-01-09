import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import axios, { CancelTokenSource } from "axios";
import Honeybadger from "../lib/honeybadger";
import { v4 as uuidv4 } from "uuid";
import useSpace from "../hooks/useSpace";
import { WrappedFile } from "../interfaces";

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
  const { uploadFile } = useSpace(code);

  const sourceRef = useRef<CancelTokenSource | null>(null);

  useEffect(() => {
    // eslint-disable-next-line
    (async function () {
      if (size() > 0) {
        const wrappedFile = peek();

        if (!sourceRef.current) {
          sourceRef.current = axios.CancelToken.source();
        }

        try {
          uploadFile(wrappedFile, {
            cancelToken: sourceRef.current?.token,
            onPreupload: () => {
              setCurrentUpload(wrappedFile.id);
            },
            onUpload: () => {
              setCurrentUpload("");
            },
            onPostupload: () => {},
            onUploadProgress: (event) => {
              // Set upload progress for current file
              updateProgress(wrappedFile.id, event.loaded, event.total);
            },
          });
        } catch (error) {
          if (axios.isCancel(error)) {
            // Cleanup logic
            Honeybadger.notify(error.messaage);
            sourceRef.current = null;
          } else {
            Honeybadger.notify(error);
          }
        } finally {
          complete(wrappedFile.id);
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
