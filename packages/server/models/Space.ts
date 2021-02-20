import { model, Schema, Model } from "mongoose";
import { SpaceDocument } from "@floatingfile/types";

// {
// 	action: {
// 		type: String,
// 		enum: ["UPLOAD", "DOWNLOAD", "TIMEOUT", "REMOVE", "JOIN", "LEAVE"],
// 	},
// 	author: String,
// 	payload: String,
// },

// plan: [Basic,  Premium, Pro]

const SpaceSchema: Schema = new Schema({
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
});

export const SpaceModel: Model<SpaceDocument> = model<SpaceDocument>(
  "Space",
  SpaceSchema
);
