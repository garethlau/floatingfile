// TODO: Better file name
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
} from "@floatingfile/types";
import axios from "axios";

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
