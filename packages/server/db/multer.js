const keys = require("../config/keys");
const url = keys.mongoURI;
const crypto = require("crypto");
const GridFsStorage = require("multer-gridfs-storage");

// create storage object
const storage = new GridFsStorage({
  url: url,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        // const filename = buf.toString("hex") + path.extname(file.originalname);
        const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});

module.exports = storage;
