import { isMobile } from "react-device-detect";
import { saveAs } from "file-saver";

export function getMobileOperatingSystem(): string {
  // let userAgent = navigator.userAgent || navigator.vendor || window.opera;

  const userAgent = navigator.userAgent || navigator.vendor;
  if (/windows phone/i.test(userAgent)) return "Windows Phone";
  if (/android/i.test(userAgent)) return "Android";
  if (/ipad|iPhone|iPod/.test(userAgent) && !window.MSStream) return "iOS";
  return "Unknown";
}

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

  return parseFloat((_bytes / k ** i).toFixed(dm)) + " " + sizes[i];
}
