import { Space, Event, File } from "./interfaces";

export type CreateSpaceFn = () => Promise<Space>;
export type DestroySpaceFn = (code: string) => Promise<void>;
export type GetSpaceFn = (code: string) => Promise<Space | null>;
export type AddEventFn = (event: {
  belongsTo: string;
  action: string;
  payload: string;
  author: string;
}) => Promise<void>;

export type AddEventsFn = (
  events: {
    belongsTo: string;
    action: string;
    payload: string;
    author: string;
  }[]
) => Promise<void>;
export type GetEventsFn = (code: string) => Promise<Event[]>;
export type DeleteZipFn = (folder: string) => Promise<void>;
export type DeleteFileFn = (id: string) => Promise<void>;
export type DeleteFilesFn = (ids: string[]) => Promise<void>;
export type AddFileFn = (file: {
  code: string;
  key: string;
  name: string;
  type: string;
  ext: string;
  size: string;
}) => Promise<void>;
export type GetFilesFn = (code: string) => Promise<File[]>;
export type DownloadZipFn = (args: {
  code: string;
  ids: string[];
}) => Promise<{ filename: string; files: { path: string; name: string }[] }>;
