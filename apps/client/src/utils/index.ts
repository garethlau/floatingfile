export function getMobileOperatingSystem(): string {
  // let userAgent = navigator.userAgent || navigator.vendor || window.opera;

  const userAgent = navigator.userAgent || navigator.vendor;
  if (/windows phone/i.test(userAgent)) return "Windows Phone";
  if (/android/i.test(userAgent)) return "Android";
  if (/ipad|iPhone|iPod/.test(userAgent) && !window.MSStream) return "iOS";
  return "Unknown";
}

export function saveBlob(data: any, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create blob data to download
    const blobData = [data];
    const blob = new Blob(blobData, { type: data.type });
    // Adjust the download mmethod based on operating system
    const os = getMobileOperatingSystem();
    if (os === "iOS") {
      const reader = new FileReader();
      reader.onload = () => {
        window.location.href = reader.result?.toString() || "";
      };

      reader.addEventListener("loadend", () => {
        resolve(filename);
      });

      reader.addEventListener("error", () => {
        reject(new Error(`Error reading file ${filename}`));
      });

      reader.readAsDataURL(blob);
    } else {
      try {
        const blobURL = window.URL.createObjectURL(blob);
        const tempLink = document.createElement("a");
        tempLink.style.display = "none";
        tempLink.href = blobURL;
        tempLink.setAttribute("download", filename);
        if (typeof tempLink.download === "undefined") {
          tempLink.setAttribute("target", "_blank");
        }

        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
        window.URL.revokeObjectURL(blobURL);
        resolve(filename);
      } catch (err) {
        reject(new Error(`Error reading file ${filename}`));
      }
    }
  });
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
