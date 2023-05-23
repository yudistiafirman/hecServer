const { uploadFiles } = require("../middleware/uploadFiles");
const {
  postFacility,
  getAllFacility,
  getOneFacility,
  deleteFacility,
  updateFacilityStatus,
} = require("../controllers/facilityController");

const facilityRoute = require("express").Router();

facilityRoute.post("/create", uploadFiles, postFacility);
facilityRoute.get("/all", getAllFacility);
facilityRoute.get("/:id", getOneFacility);
facilityRoute.put("/update/:id", updateFacilityStatus);
facilityRoute.put("/delete", deleteFacility);

module.exports = facilityRoute;
