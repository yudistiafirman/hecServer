const {
  postPartnerShipGallery,
  getAllPartnerShipGallery,
  getOnePartnerShipGallery,
  updatePartnerShipGalleryStatus,
  deletePartnerShipGallery,
} = require("../controllers/partnerShipGalleryController");
const { uploadFiles } = require("../middleware/uploadFiles");

const partnershipGalleryRoute = require("express").Router();

partnershipGalleryRoute.post("/create", uploadFiles, postPartnerShipGallery);
partnershipGalleryRoute.get("/all", getAllPartnerShipGallery);
partnershipGalleryRoute.get("/:id", getOnePartnerShipGallery);
partnershipGalleryRoute.put("/update/:id", updatePartnerShipGalleryStatus);
partnershipGalleryRoute.put("/delete", deletePartnerShipGallery);

module.exports = partnershipGalleryRoute;
