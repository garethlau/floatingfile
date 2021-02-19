// keys for production
module.exports = {
	mongoURI: process.env.mongoURI,
	stripePK: process.env.stripePK,
	stripeSK: process.env.stripeSK,
	s3AccessKeyId: process.env.s3AccessKeyId,
	s3AccessKeySecret: process.env.s3AccessKeySecret,
	s3BucketName: process.env.s3BucketName,
	MONGO_URI: process.env.MONGO_URI,
	AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
	AWS_ACCESS_KEY_SECRET: process.env.AWS_ACCESS_KEY_SECRET,
	S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
};
