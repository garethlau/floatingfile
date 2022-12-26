import {
  FindSpaceFn,
  CreateSpaceFn,
  DestroySpaceFn,
  PreDownloadFn,
  PostUploadFn,
  PostDownloadFn,
  RemoveFn,
  RemoveManyFn,
  GenerateUsernameFn,
  PreUploadFn,
  InitChunkUploadFn,
  CompleteChunkUploadFn,
  AbortChunkUploadFn,
} from "@floatingfile/types";
import axios from "axios";
import { API_URL } from "../constants";

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
  initChunkUpload: InitChunkUploadFn;
  abortChunkUpload: AbortChunkUploadFn;
  completeChunkUpload: CompleteChunkUploadFn;
};

const invoke = <Endpoint extends keyof API>(
  endpoint: Endpoint,
  ...params: Parameters<API[Endpoint]>
): ReturnType<API[Endpoint]> => {
  return axios
    .post(`${API_URL}/api/rpc`, {
      endpoint,
      params,
    })
    .then((response) => {
      return response.data;
    }) as any;
};

const rpcClient = {
  invoke,
};
export default rpcClient;
