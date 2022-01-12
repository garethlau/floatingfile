import readline from "readline";

export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

export const prompt = (query: string): Promise<string> =>
  new Promise((resolve) => rl.question(`${query}\n`, (val) => resolve(val)));

export default rl;
