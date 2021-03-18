import { model, Schema, Model, Document } from "mongoose";
import { Space } from "@floatingfile/types";

const SpaceSchemaFields: Record<keyof Space, any> = {
  code: String,
  files: Array,
  expires: String,
  history: Array,
  users: Array,
  plan: {
    type: String,
    default: "Basic",
    options: ["Basic", "Premium"],
  },
  size: {
    type: Number,
    default: 0,
  },
  capacity: {
    type: Number,
    default: 1073741824,
  },
  maxUsers: {
    type: Number,
    default: 3,
  },
  createdAt: { type: Date, expires: 24 * 60 * 60, default: Date.now },
};

interface SpaceDocument extends Space, Document {}

const SpaceSchema: Schema = new Schema(SpaceSchemaFields);

export const SpaceModel = model<SpaceDocument>("Space", SpaceSchema);
