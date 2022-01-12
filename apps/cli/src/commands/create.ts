import rpcClient from "../lib/rpc";
import { addCode, fetchConfig } from "../lib/storage";

export const command: string = "create";
export const desc: string = "Create a new space";

export const handler = async (): Promise<void> => {
  const username: string = fetchConfig("username");
  const space = await rpcClient.invoke("createSpace", { username });
  if (!space) {
    return;
  }
  addCode(space.code);
  const message = `Your newly created space can be accessed here:\n\nhttps://app.floatingfile.space/s/${space.code}\n\nThe code has been saved and will be used for following commands.\nIf you wish to override this code, you cna do so via the --code flag.\n`;
  process.stdout.write(message);
  process.exit();
};
