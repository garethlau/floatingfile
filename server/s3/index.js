const AWS = require("aws-sdk");
const keys = require("../config/keys");

AWS.config.update({
	accessKeyId: keys.AWS_ACCESS_KEY_ID,
	secretAccessKey: keys.AWS_ACCESS_KEY_SECRET,
	signatureVersion: "v4",
	region: "us-east-2",
});

const s3 = new AWS.S3();
module.exports = s3;
