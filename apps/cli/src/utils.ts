import rpcClient from "./lib/rpc";

export async function doesSpaceExist(code: string) {
  const space = await rpcClient.invoke("findSpace", { code });
  return !!space;
}
