const AWS = require("aws-sdk");
const { AWS_ACCESS_KEY_ID, AWS_ACCESS_KEY_SECRET } = require("../config");

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_ACCESS_KEY_SECRET,
  signatureVersion: "v4",
  region: "us-east-2",
});

const s3 = new AWS.S3();
module.exports = s3;
