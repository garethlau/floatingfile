import { File } from "./File";
import { HistoryRecord } from "./HistoryRecord";
import { User } from "./User";
import { Document } from "mongoose";

export interface Space {
  code: string;
  files: File[];
  expires: string;
  history: HistoryRecord[];
  users: User[];
  size: number;
  capacity: number;
  maxUsers: number;
}

export interface SpaceDocument extends Space, Document {}
