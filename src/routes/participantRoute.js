const {
	createParticipant,
	createCertificate,
	getOneParticipant,
	getAllParticipant,
	deleteParticipants,
	deleteCertificates,
	searchCertificateByNumber,
} = require("../controllers/participantController");
const { uploadFiles } = require("../middleware/uploadFiles");

const participantRoute = require("express").Router();

participantRoute.post("/create", uploadFiles, createParticipant);
participantRoute.delete("/delete", deleteParticipants);
participantRoute.get("/all", getAllParticipant);
participantRoute.get("/:participantId", getOneParticipant);
participantRoute.post("/create/certificate/:participantId", createCertificate);
participantRoute.delete("/delete/certificate", deleteCertificates);
participantRoute.get("/search/certificate", searchCertificateByNumber);

module.exports = participantRoute;
