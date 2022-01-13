import {
  FindSpaceFn,
  CreateSpaceFn,
  DestroySpaceFn,
  PredownloadFn,
  PostuploadFn,
  PostdownloadFn,
  RemoveFn,
  RemoveManyFn,
  GenerateUsernameFn,
  PreuploadFn,
  InitChunkUploadFn,
  CompleteChunkUploadFn,
  AbortChunkUploadFn,
} from "@floatingfile/types";
import axios from "axios";

// FIXME: Read API url from env
const API_URL = "https://staging.floatingfile.space";

type API = {
  generateUsername: GenerateUsernameFn;
  createSpace: CreateSpaceFn;
  destroySpace: DestroySpaceFn;
  findSpace: FindSpaceFn;
  preupload: PreuploadFn;
  postupload: PostuploadFn;
  predownload: PredownloadFn;
  postdownload: PostdownloadFn;
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
