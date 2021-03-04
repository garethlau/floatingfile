export interface File {
  ext: string;
  key: string;
  name: string;
  signedUrl?: string;
  size: number;
  type: string;
  previewSignedUrl?: string;
}
