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
  plan: "Basic" | "Premium";
  createdAt: Date;
}

// TODO - Remove this exported interface once v4 APIs are deprecated.
// @floatingfile/server defines its own SpaceDocument interface.
export interface SpaceDocument extends Space, Document {}
