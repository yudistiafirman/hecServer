const {
	createParticipant,
	createCertificate,
	getOneParticipant,
	getAllParticipant,
	deleteParticipants,
	deleteCertificates,
	searchCertificateByNumber,
	editParticipant,
	editCertificate,
} = require("../controllers/participantController");
const { uploadFiles } = require("../middleware/uploadFiles");

const participantRoute = require("express").Router();

participantRoute.post("/create", uploadFiles, createParticipant);
participantRoute.delete("/delete", deleteParticipants);
participantRoute.get("/all", getAllParticipant);
participantRoute.get("/:participantId", getOneParticipant);
participantRoute.put("/edit/:participantId", uploadFiles, editParticipant);
participantRoute.post("/create/certificate/:participantId", createCertificate);
participantRoute.delete("/delete/certificate", deleteCertificates);
participantRoute.get("/search/certificate", searchCertificateByNumber);
participantRoute.put("/edit/certificate/:certificateId", editCertificate);

module.exports = participantRoute;
