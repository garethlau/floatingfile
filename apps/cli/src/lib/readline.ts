import readline from "readline";

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}
export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

export const prompt = (query: string): Promise<string> =>
  new Promise((resolve) =>
    rl.question(`${query}\n`, (val) => resolve(val.trim()))
  );

export const promptYesNo = async (query: string): Promise<boolean> => {
  const input = await prompt(query);
  if (input.toLowerCase() === "yes" || input.toLowerCase() === "y") {
    return true;
  }
  return false;
};

export const promptNums = async (
  query: string,
  options?: {
    min?: number;
    max?: number;
    throwOnError?: boolean;
  }
): Promise<number[]> => {
  const { min = 0, max = Infinity, throwOnError = true } = options || {};
  const input = await prompt(query);
  const indexes = input
    .split(/[ ,]+/)
    .map((s) => {
      const p = parseInt(s);
      if (isNaN(p)) {
        if (throwOnError) {
          throw new TypeError(`Unable to parse number: ${s}`);
        } else {
          return null;
        }
      }
      if (p < min || p > max) {
        if (throwOnError) {
          throw new RangeError(`Input ${p} out of range ${min}-${max} `);
        } else {
          return null;
        }
      }
      return p;
    })
    .filter(notEmpty);
  return indexes;
};

export default rl;
