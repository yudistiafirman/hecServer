const multer = require("multer");
const fs = require("fs");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdir("./uploads/", (err) => {
      cb(null, "./uploads/");
    });
  },
  filename: function (req, file, cb) {
    cb(
      null,
      "HIMG-" +
        Date.now() +
        Math.random() * 1000 +
        "." +
        file.mimetype.split("/")[1]
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fieldSize: 200000000 },
}).array("file");

module.exports = upload;
