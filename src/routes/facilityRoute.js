const { uploadFiles } = require("../middleware/uploadFiles");
const {
  postFacility,
  getAllFacility,
  getOneFacility,
} = require("../controllers/facilityController");

const facilityRoute = require("express").Router();

facilityRoute.post("/create", uploadFiles, postFacility);
facilityRoute.get("/all", getAllFacility);
facilityRoute.get("/:id", getOneFacility);

module.exports = facilityRoute;
