const upload = require("../helpers/upload");

const uploadFiles = async (req, res, next) => {
  upload(req, res, (err) => {
    try {
      if (req.files.length === 0) {
        res.status(400).send({
          success: false,
          message: "Files Not Found",
        });
      } else {
        req.imagePath = req.files;
        next();
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Terjadi Error Saat Upload files",
      });
    }
  });
};

module.exports = {
  uploadFiles,
};
