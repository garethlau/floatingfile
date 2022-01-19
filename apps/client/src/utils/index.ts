export function formatBytes(bytes: string | number, decimals = 2) {
  let _bytes: number;
  if (typeof bytes === "number") {
    _bytes = bytes;
  } else if (typeof bytes === "string") {
    _bytes = parseInt(bytes, 10);
  } else throw new TypeError();

  if (_bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(_bytes) / Math.log(k));

  return `${parseFloat((_bytes / k ** 1).toFixed(dm))} ${sizes[i]}`;
}

export default {
  formatBytes,
};
