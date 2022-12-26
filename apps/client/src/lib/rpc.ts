// TODO: Better file name
import {
  GenerateUsernameFn,
  FindSpaceFn,
  CreateSpaceFn,
  DestroySpaceFn,
  PreDownloadFn,
  PostDownloadFn,
  RemoveFn,
  RemoveManyFn,
  PreUploadFn,
  PostUploadFn,
} from "@floatingfile/types";
import axios from "axios";

type API = {
  generateUsername: GenerateUsernameFn;
  createSpace: CreateSpaceFn;
  destroySpace: DestroySpaceFn;
  findSpace: FindSpaceFn;
  preUpload: PreUploadFn;
  postUpload: PostUploadFn;
  preDownload: PreDownloadFn;
  postDownload: PostDownloadFn;
  removeFile: RemoveFn;
  removeFiles: RemoveManyFn;
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
