const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URI: process.env.MONGO_URI,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_ACCESS_KEY_SECRET: process.env.AWS_ACCESS_KEY_SECRET,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  HONEYBADGER_API_KEY: process.env.HONEYBADGER_API_KEY,
};
