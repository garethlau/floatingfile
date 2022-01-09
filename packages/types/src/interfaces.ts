export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface Event extends Timestamps {
  id: string;
  action: string;
  payload: string;
  author: string;
  belongsTo: string;
}

export interface File extends Timestamps {
  id: string;
  key: string;
  ext: string;
  name: string;
  size: string;
  type: string;
  previewUrl?: string;
  belongsTo: string;
}

export interface Space extends Timestamps {
  code: string;
  files: File[];
  events: Event[];
}

export enum EventTypes {
  CONNECTION_ESTABLISHED = "CONNECTION_ESTABLISHED",
  FILES_UPDATED = "FILES_UPDATED",
  HISTORY_UPDATED = "HISTORY_UPDATED",
  USERS_UPDATED = "USERS_UPDATED",
  SPACE_DELETED = "SPACE_DELETED",
}
