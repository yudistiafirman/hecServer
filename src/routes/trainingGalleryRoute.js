const {
  postTrainingGallery,
  getOneTrainingGallery,
  getAllTrainingGallery,
  updateTrainingGalleryStatus,
  deleteTrainingGallery,
} = require("../controllers/trainingGalleryController");
const { uploadFiles } = require("../middleware/uploadFiles");

const trainingGalleryRoute = require("express").Router();

trainingGalleryRoute.post("/create", uploadFiles, postTrainingGallery);
trainingGalleryRoute.get("/all", getAllTrainingGallery);
trainingGalleryRoute.get("/:id", getOneTrainingGallery);
trainingGalleryRoute.put("/update/:id", updateTrainingGalleryStatus);
trainingGalleryRoute.put("/delete", deleteTrainingGallery);

module.exports = trainingGalleryRoute;
