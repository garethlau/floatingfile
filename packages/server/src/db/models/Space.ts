import { Schema, model, Model, Document, models } from "mongoose";
import { Space } from "@floatingfile/types";

export interface SpaceBaseDocument extends Space, Document {}

export interface SpaceDocument extends SpaceBaseDocument {}

export interface SpacePopulatedDocument extends SpaceBaseDocument {}

export interface SpaceModel extends Model<SpaceDocument> {
  findByCode(code: string): Promise<SpaceDocument>;
}

const SpaceSchema = new Schema<SpaceDocument, SpaceModel>({
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

SpaceSchema.statics.findByCode = async function (
  this: Model<SpaceDocument>,
  code: string
) {
  return this.findOne({ code }).exec();
};

export default model<SpaceDocument, SpaceModel>("Space", SpaceSchema);
