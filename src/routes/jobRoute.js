const {
  postJobs,
  getAllJobs,
  getOneJob,
  getAllJobCategories,
  updateJobStatus,
  deleteJob,
} = require("../controllers/jobController");
const { uploadFiles } = require("../middleware/uploadFiles");

const jobRoute = require("express").Router();

jobRoute.post("/create", uploadFiles, postJobs);
jobRoute.get("/get", getAllJobs);
jobRoute.get("/categories", getAllJobCategories);
jobRoute.get("/:id", getOneJob);
jobRoute.put("/update/:id", updateJobStatus);
jobRoute.put("/delete", deleteJob);

module.exports = jobRoute;
