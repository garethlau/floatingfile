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
      reader.onload = (e) => {
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

export function formatFileSize(size: number): string {
  if (Number.isNaN(size)) return "";
  if (size >= 1024 ** 3) {
    return `${(size / 1024 ** 3).toFixed(1)} GB`;
  }
  if (size >= 1024 ** 2) {
    return `${(size / 1024 ** 2).toFixed(1)} MB`;
  }
  return `${(size / 1024 ** 1).toFixed(1)} KB`;
}
