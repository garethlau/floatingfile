import fs from "fs";
import os from "os";
import path from "path";
import rpcClient from "./rpc";

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

const defaultConfig = {
  username: "CLI",
  download_to: "Downloads",
  group_by_space: "No",
};

const folderPath = path.join(os.homedir(), ".floatingfile");

const filePath = path.join(folderPath, "data.json");

export const init = () => {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    fs.writeFileSync(filePath, "{}");
  }
};

export const read = () => {
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw);
  return parsed;
};

export const write = (data: any) => {
  const s = JSON.stringify(data);
  fs.writeFileSync(filePath, s);
  return;
};

export const fetchCodes = async () => {
  const data = read();
  const codes: string[] = data.codes || [];
  const c = await Promise.all(
    codes.map(
      (code) =>
        new Promise<string | null>(async (resolve, reject) => {
          if (!code) resolve(null);
          const space = await rpcClient.invoke("findSpace", { code });
          if (space) {
            resolve(code);
          } else {
            removeCode(code);
            resolve(null);
          }
        })
    )
  );
  const validCodes = c.filter(notEmpty);
  return validCodes;
};

export const saveCodes = (codes: string[]) => {
  const data = read();
  let update = data;
  update.codes = codes;
  write(update);
};

export const addCode = (code: string) => {
  const data = read();
  let update = data;
  const codes = data.codes || [];
  if (Array.isArray(codes)) {
    if (codes.includes(code)) {
      return;
    } else {
      update.codes = [code, ...codes];
    }
  }
  write(update);
  return;
};

export const removeCode = (code: string) => {
  const data = read();
  let update = data;
  const codes = data.codes || [];
  if (Array.isArray(codes)) {
    update.codes = codes.filter((c) => c !== code);
  }
  write(update);
  return;
};

export const fetchConfig = (field?: string) => {
  const data = read();
  const config = data.config || defaultConfig;
  if (!field) {
    return config;
  } else {
    return config[field];
  }
};
export const saveConfig = (field: string, value: string) => {
  const data = read();
  let update = data;
  let config = update.config || defaultConfig;
  config[field] = value;
  update.config = config;
  write(update);
  return;
};
