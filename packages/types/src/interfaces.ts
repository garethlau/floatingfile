export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface Event extends Timestamps {
  id: string;
  action: string;
  payload?: string;
  author: string;
  belongsTo: string;
}

export interface Client {
  id: string;
  username: string;
  connectedTo: string;
  createdAt: string;
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

export enum NotificationTypes {
  CONNECTION_ESTABLISHED = "CONNECTION_ESTABLISHED",
  SPACE_UPDATED = "SPACE_UPDATED",
  SPACE_DESTROYED = "SPACE_DESTROYED",
}
