export interface WrappedFile {
  file: File;
  // ID used soley by the client to keep track of uploads
  id: string;
  ext: string;
}
