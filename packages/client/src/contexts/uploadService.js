import React, { createContext, useState, useRef, useEffect } from "react";
import axios from "axios";
import { BASE_API_URL } from "../env";
import { v4 as uuidv4 } from "uuid";

export const UploadServiceContext = createContext();

export function UploadServiceProvider({ children }) {
  const [pending, setPending] = useState([]);
  const [code, setCode] = useState();
  const [progress, setProgress] = useState({});
  const [currentUpload, setCurrentUpload] = useState();

  const sourceRef = useRef();

  useEffect(() => {
    (async function () {
      if (size() > 0) {
        const file = peek();

        if (!sourceRef.current) {
          sourceRef.current = axios.CancelToken.source();
        }

        try {
          await new Promise((resolve, reject) => {
            const data = {
              key: file.key,
              size: file.size,
              name: file.name,
              type: file.type,
              ext: file.ext,
            };
            axios
              .post(`${BASE_API_URL}/api/v4/signed-urls`, { file, code })
              .then((response) => {
                const { signedUrl } = response.data;
                setCurrentUpload(file.key);
                axios
                  .put(signedUrl, file, {
                    onUploadProgress: (event) => {
                      updateProgress(file.key, event.loaded, event.total);
                    },
                    cancelToken: sourceRef.current.token,
                  })
                  .then((response) => {
                    setCurrentUpload(null);
                    axios
                      .patch(`${BASE_API_URL}/api/v4/spaces/${code}/file`, data)
                      .then((response) => {
                        resolve();
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
          complete(file.key);
          console.log("Done ", file.name);
          dequeue();
        }
      }
    })();
  }, [pending]);

  function enqueueMany(files) {
    // Add the files to the queue
    files = files.map((file) => {
      const key = uuidv4();
      const ext = file.name.split(".")[file.name.split(".").length - 1];
      file.key = key;
      file.ext = ext;
      return file;
    });

    setPending((prev) => [...prev, ...files]);
  }

  function dequeue() {
    const top = pending[0];
    setPending((prev) => prev.slice(1));
    return top;
  }

  function peek() {
    return pending[0];
  }

  function size() {
    return pending.length;
  }

  function updateProgress(key, loaded, total) {
    setProgress((prev) => ({
      ...prev,
      [key]: loaded / total,
    }));
  }

  function getProgress(key) {
    return progress[key] || null;
  }

  function complete(key) {
    setProgress((prev) => {
      const newProgress = Object.assign({}, prev);
      delete newProgress[key];
      return newProgress;
    });
  }

  function cancel(key) {
    console.log("Cancelling upload ", key);
    sourceRef.current.cancel("Operation cancelled");
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
}
