//  https://github.com/strukturag/libheif/issues/83

// https://github.com/sindresorhus/file-type/blob/6f901bd82b849a85ca4ddba9c9a4baacece63d31/core.js#L428-L438

export function isHeic(buffer: Buffer) {
  const brandMajor = String.fromCharCode(...buffer.slice(8, 12))
    .replace("\0", " ")
    .trim();

  switch (brandMajor) {
    case "mif1":
      return true; // {ext: 'heic', mime: 'image/heif'};
    case "msf1":
      return true; // {ext: 'heic', mime: 'image/heif-sequence'};
    case "heic":
    case "heix":
      return true; // {ext: 'heic', mime: 'image/heic'};
    case "hevc":
    case "hevx":
      return true; // {ext: 'heic', mime: 'image/heic-sequence'};
  }

  return false;
}
