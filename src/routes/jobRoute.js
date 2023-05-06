const { postJobs } = require("../controllers/jobController");
const uploadFiles = require("../middleware/uploadFiles");

const jobRoute = require("express").Router();

jobRoute.post("/create", uploadFiles, postJobs);

module.exports = jobRoute;
