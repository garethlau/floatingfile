import mongoose from "mongoose";
import { MONGO_URI } from "../config";

export default function init(): Promise<null> {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      MONGO_URI,
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
      },
      (error) => {
        if (error) {
          reject(error);
        }
        resolve(null);
      }
    );
  });
}
