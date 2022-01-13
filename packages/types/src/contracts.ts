import { Space, Event, File, Client } from "./interfaces";

export type FindSpaceFn = (params: { code: string }) => Promise<
  | (Space & {
      files: File[];
      events: Event[];
      clients: Client[];
    })
  | null
>;

export type CreateSpaceFn = (params: {
  username: string;
}) => Promise<{
  code: string;
  createdAt: string;
  files: File[];
  events: Event[];
  clients: Client[];
  updatedAt: string;
} | null>;

export type DestroySpaceFn = (params: { code: string }) => Promise<void>;

export type PreuploadFn = (params: {
  code: string;
  size: string;
}) => Promise<{ signedUrl: string; key: string } | null>;

export type PostuploadFn = (params: {
  code: string;
  username: string;
  file: {
    key: string;
    name: string;
    type: string;
    ext: string;
    size: string;
  };
}) => Promise<void>;

export type PredownloadFn = (params: {
  id: string;
}) => Promise<{ signedUrl: string }>;

export type PostdownloadFn = (params: {
  code: string;
  username: string;
  name: string;
}) => Promise<void>;

export type RemoveFn = (params: {
  username: string;
  id: string;
}) => Promise<void>;

export type RemoveManyFn = (params: {
  username: string;
  ids: string[];
}) => Promise<void>;

export type GenerateUsernameFn = () => { username: string };

export type InitChunkUploadFn = (params: { numChunks: string }) => Promise<{
  uploadId: string;
  key: string;
  signedUrls: string[];
}>;

export type AbortChunkUploadFn = (params: {
  key: string;
  uploadId: string;
}) => Promise<void>;

export type CompleteChunkUploadFn = (params: {
  uploadId: string;
  key: string;
  parts: {
    eTag: string;
    number: string;
  }[];
}) => Promise<void>;
