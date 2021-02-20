import { File } from "./File";
import { HistoryRecord } from "./HistoryRecord";
import { User } from "./User";

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
