// TODO: Better file name
import type {
  generateUsername,
  createSpace,
  destroySpace,
  findSpace,
  preupload,
  postupload,
  predownload,
  postdownload,
  removeFile,
  removeFiles,
} from "@floatingfile/server";
import axios from "axios";

type API = {
  generateUsername: typeof generateUsername;
  createSpace: typeof createSpace;
  destroySpace: typeof destroySpace;
  findSpace: typeof findSpace;
  preupload: typeof preupload;
  postupload: typeof postupload;
  predownload: typeof predownload;
  postdownload: typeof postdownload;
  removeFile: typeof removeFile;
  removeFiles: typeof removeFiles;
};

const query = <Endpoint extends keyof API>(
  endpoint: Endpoint,
  ...params: Parameters<API[Endpoint]>
): ReturnType<API[Endpoint]> => {
  return fetch("/api/rpc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint, params }),
  }).then((response) => response.json()) as any;
};

const invoke = <Endpoint extends keyof API>(
  endpoint: Endpoint,
  ...params: Parameters<API[Endpoint]>
): ReturnType<API[Endpoint]> => {
  return axios
    .post("/api/rpc", {
      endpoint,
      params,
    })
    .then((response) => response.data) as any;
};

const rpcClient = {
  invoke,
};
export default rpcClient;
