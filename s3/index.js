const AWS = require("aws-sdk");
const keys = require("../config/keys");

const s3 = new AWS.S3({
	accessKeyId: keys.s3AccessKeyId,
	secretAccessKey: keys.s3AccessKeySecret,
	Bucket: keys.s3BucketName,
});

module.exports = s3;
