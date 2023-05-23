const {
  postHomeGallery,
  getAllHomeGallery,
  getOneHomeGallery,
  updateHomeGalleryStatus,
  deleteHomeGallery,
} = require("../controllers/homeGalleryController");
const { uploadFiles } = require("../middleware/uploadFiles");

const homeGalleryRoute = require("express").Router();

homeGalleryRoute.post("/create", uploadFiles, postHomeGallery);
homeGalleryRoute.get("/all", getAllHomeGallery);
homeGalleryRoute.get("/:id", getOneHomeGallery);
homeGalleryRoute.put("/update/:id", updateHomeGalleryStatus);
homeGalleryRoute.put("/delete", deleteHomeGallery);

module.exports = homeGalleryRoute;
