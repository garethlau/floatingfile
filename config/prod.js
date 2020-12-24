// keys for production
module.exports = {
    mongoURI: process.env.mongoURI,
    stripePK: process.env.stripePK,
    stripeSK: process.env.stripeSK,
    s3AccessKeyId: process.env.s3AccessKeyId,
    s3AccessKeySecret: process.env.s3AccessKeySecret,
    s3BucketName: process.env.s3BucketName
};