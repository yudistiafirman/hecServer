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
var filefilter = (req, file, next) => {
  try {
    if (file.mimetype.includes("image") === false)
      throw "File Must Be An Image";
    next(null, true);
  } catch (error) {
    req.bebas = error;
    next(null, false);
  }
};

const upload = multer({
  storage: storage,
  filefilter: filefilter,
  limits: { fieldSize: 200000000 },
}).single("file");

module.exports = upload;
