const {
  postTraining,
  getAllTraining,
  getOneTraining,
  updateTrainingStatus,
  deieteTraining,
  getTrainingCategories,
  updatePopularTraining,
  updateFullTraining,
} = require("../controllers/trainingController");
const { uploadFiles } = require("../middleware/uploadFiles");

const trainingRoute = require("express").Router();

trainingRoute.post("/create", uploadFiles, postTraining);
trainingRoute.get("/all", getAllTraining);
trainingRoute.get("/categories", getTrainingCategories);
trainingRoute.get("/:id", getOneTraining);
trainingRoute.put("/update/:id", updateTrainingStatus);
trainingRoute.put("/update-popular/:id", updatePopularTraining);
trainingRoute.put("/update-full/:id", updateFullTraining);
trainingRoute.put("/delete", deieteTraining);

module.exports = trainingRoute;
