const query = require("../config/connection");
const fs = require("fs");
const path = require("path");

const createParticipant = async (req, res) => {
	try {
		const {
			participantName,
			email,
			phoneNumber,
			address,
			register_date,
			NIS,
		} = req.body;
		if (!participantName) {
			res.status(400).send({
				success: false,
				message: "Nama Peserta tidak boleh kosong",
			});
		} else if (!email) {
			res.status(400).send({
				success: false,
				message: "Email Peserta tidak boleh kosong",
			});
		} else if (!NIS) {
			res.status(400).send({
				success: false,
				message: "Tanggal Pendaftaran Peserta tidak boleh kosong",
			});
		} else {
			const insertFile = await query(
				"INSERT into files (file_url) VALUES (?)",
				[req.imagePath[0].path]
			);

			const insertParticipant = await query(
				"INSERT INTO participant (name, email, phone_number, address, register_date, NIS, files_id) VALUES (?,?,?,?,?,?,?)",
				[
					participantName,
					email,
					phoneNumber,
					address,
					register_date,
					NIS,
					insertFile.insertId,
				]
			);

			res.status(201).send({
				success: true,
				message: "Peserta baru berhasil dibuat",
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).send({
			success: false,
			message: "Terjadi Error Saat Pembuatan Peserta Baru ",
		});
	}
};

const deleteParticipants = async (req, res) => {
	try {
		const { participantIds } = req.body;
		if (!participantIds || participantIds.length === 0) {
			return res.status(400).send({
				success: false,
				message: "Array ID peserta tidak boleh kosong",
			});
		}

		// Mengambil file URLs dan file IDs
		const filesData = await query(
			`SELECT files.id, files.file_url FROM participant JOIN files ON participant.files_id = files.id WHERE participant.id IN (${participantIds.join(
				", "
			)})`
		);

		// Hapus sertifikat terkait
		await query(
			`DELETE FROM certificate WHERE participant_id IN (${participantIds.join(
				", "
			)})`
		);

		// Hapus file fisik
		filesData.forEach((file) => {
			const filePath = path.join(__dirname, "../uploads", file.file_url);
			fs.unlink(filePath, (err) => {
				if (err)
					console.error(`Error deleting file ${filePath}: ${err}`);
			});
		});

		await query(
			`DELETE FROM participant WHERE id IN (${participantIds.join(", ")})`
		);

		// Hapus data dari tabel files dan participant
		const fileIds = filesData.map((file) => file.id);
		if (fileIds.length > 0) {
			await query(
				`DELETE FROM files WHERE id IN (${fileIds.join(", ")})`
			);
		}

		res.status(200).send({
			success: true,
			message: "Peserta, file, dan sertifikat terkait berhasil dihapus",
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({
			success: false,
			message: "Terjadi Error Saat Penghapusan Peserta",
		});
	}
};

const getAllParticipant = async (req, res) => {
	try {
		const search = req.query.search || "";
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const offset = (page - 1) * limit;

		let baseQuery = `SELECT * from participant where name like '%${search}%'`;
		baseQuery += `LIMIT ${limit} OFFSET ${offset}`;
		const participantData = await query(baseQuery);
		const totalData = await query(
			`SELECT COUNT(*) AS total FROM participant`
		);
		const total = totalData[0].total;
		const totalPages = Math.ceil(total / limit);
		res.status(200).send({
			page,
			limit,
			totalPages,
			totalItems: total,
			data: participantData,
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({
			success: false,
			message: "Terjadi Error Saat Pembuatan Peserta Baru ",
		});
	}
};

const getOneParticipant = async (req, res) => {
	try {
		const { participantId } = req.params;
		if (!participantId) {
			res.status(400).send({
				success: false,
				message: "id peserta tidak boleh kosong",
			});
		} else {
			const participantDetail = await query(
				`SELECT participant.id, participant.name, participant.NIS, participant.email, participant.phone_number, participant.address, participant.register_date, 
				files.file_url as participant_photo
				from participant join files on participant.files_id = files.id where participant.id = ${participantId}`
			);
			const participantCertificates = await query(`
				SELECT * from certificate where participant_id = ${participantId}
			`);

			participantDetail[0].certificates = participantCertificates;

			res.status(200).send({
				success: true,
				data: participantDetail[0],
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).send({
			success: false,
			message: "Terjadi Error Saat Pengambilan data detail peserta ",
		});
	}
};

const createCertificate = async (req, res) => {
	try {
		const { participantId } = req.params;
		const { trainingName, batch, certificateNumber } = req.body;

		if (!participantId) {
			res.status(400).send({
				success: false,
				message: "id peserta tidak boleh kosong",
			});
		} else if (!trainingName) {
			res.status(400).send({
				success: false,
				message: "nama pelatihan tidak boleh kosong",
			});
		} else if (!batch) {
			res.status(400).send({
				success: false,
				message: "batch tidak boleh kosong",
			});
		} else if (!certificateNumber) {
			res.status(400).send({
				success: false,
				message: "nomer sertifikat tidak boleh kosong",
			});
		} else {
			const isParticipantExist = await query(
				`SELECT ID from participant where id = ${participantId}`
			);
			if (isParticipantExist.length > 0) {
				const insertCertificate = await query(
					"INSERT INTO certificate (participant_id, training_name, batch, number) VALUES(?,?,?,?)",
					[participantId, trainingName, batch, certificateNumber]
				);
				res.status(201).send({
					success: true,
					message: "Sertifikat baru berhasil dibuat",
				});
			} else {
				res.status(400).send({
					success: false,
					message: "Peserta tidak ditemukan",
				});
			}
		}
	} catch (error) {
		res.status(500).send({
			success: false,
			message: "Terjadi Error Saat Pembuatan Sertifikat Baru ",
		});
	}
};

const deleteCertificates = async (req, res) => {
	try {
		const { certificateIds } = req.body; // Array of certificate IDs to delete
		if (!certificateIds || certificateIds.length === 0) {
			return res.status(400).send({
				success: false,
				message: "Array ID sertifikat tidak boleh kosong",
			});
		}

		const ids = certificateIds.join(", ");
		await query(`DELETE FROM certificate WHERE id IN (${ids})`);

		res.status(200).send({
			success: true,
			message: "Sertifikat berhasil dihapus",
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({
			success: false,
			message: "Terjadi Error Saat Penghapusan Sertifikat",
		});
	}
};

const searchCertificateByNumber = async (req, res) => {
	try {
		const { certificateNumber } = req.query; // Mengambil nomor sertifikat dari query parameter
		if (!certificateNumber) {
			return res.status(400).send({
				success: false,
				message: "Nomor sertifikat tidak boleh kosong",
			});
		}

		const certificateData = await query(
			`SELECT certificate.*, participant.name AS participant_name,participant.NIS as nis , files.file_url AS participant_photo
             FROM certificate 
             JOIN participant ON certificate.participant_id = participant.id 
             JOIN files ON participant.files_id = files.id 
             WHERE certificate.number = ?`,
			[certificateNumber]
		);

		if (certificateData.length === 0) {
			return res.status(404).send({
				success: false,
				message: "Sertifikat tidak ditemukan",
			});
		}

		res.status(200).send({
			success: true,
			data: certificateData[0],
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({
			success: false,
			message: "Terjadi Error Saat Pencarian Sertifikat",
		});
	}
};

const editParticipant = async (req, res) => {
	try {
		const { participantId } = req.params;
		const {
			participantName,
			email,
			phoneNumber,
			address,
			register_date,
			NIS,
		} = req.body;

		// Cek apakah ada file baru yang diupload
		if (req.files && req.imagePath) {
			const newFilePath = req.imagePath[0].path;

			// Mengambil file_id lama
			const filesData = await query(
				`SELECT files_id FROM participant WHERE id = ?`,
				[participantId]
			);
			const oldFileId = filesData[0].files_id;

			// Menghapus file lama
			const oldFileData = await query(
				`SELECT file_url FROM files WHERE id = ?`,
				[oldFileId]
			);
			const oldFilePath = path.join(
				__dirname,
				"../",
				oldFileData[0].file_url
			);
			fs.unlinkSync(oldFilePath);

			// Memasukkan file baru
			const insertFile = await query(
				"INSERT INTO files (file_url) VALUES (?)",
				[newFilePath]
			);

			// Update file_id di tabel participant
			await query(`UPDATE participant SET files_id = ? WHERE id = ?`, [
				insertFile.insertId,
				participantId,
			]);
		}

		// Update data peserta
		const updateQuery = `
            UPDATE participant 
            SET name = ?, email = ?, phone_number = ?, address = ?, register_date = ?, NIS = ?
            WHERE id = ?`;

		await query(updateQuery, [
			participantName,
			email,
			phoneNumber,
			address,
			register_date,
			NIS,
			participantId,
		]);

		res.status(200).send({
			success: true,
			message: "Data peserta dan foto berhasil diupdate",
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({
			success: false,
			message: "Terjadi Error Saat Mengupdate Data Peserta",
		});
	}
};

const editCertificate = async (req, res) => {
	try {
		const { certificateId } = req.params;
		const { trainingName, batch, certificateNumber } = req.body;

		let updates = [];
		let data = [];

		if (trainingName) {
			updates.push("training_name = ?");
			data.push(trainingName);
		}
		if (batch) {
			updates.push("batch = ?");
			data.push(batch);
		}
		if (certificateNumber) {
			updates.push("number = ?");
			data.push(certificateNumber);
		}

		if (updates.length === 0) {
			return res.status(400).send({
				success: false,
				message: "No data provided to update",
			});
		}

		const updateQuery = `UPDATE certificate SET ${updates.join(
			", "
		)} WHERE id = ?`;
		data.push(certificateId); // Add certificateId to the data array for the query

		await query(updateQuery, data);

		res.status(200).send({
			success: true,
			message: "Data sertifikat berhasil diupdate",
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({
			success: false,
			message: "Terjadi Error Saat Mengupdate Data Sertifikat",
		});
	}
};

module.exports = {
	createParticipant,
	getAllParticipant,
	getOneParticipant,
	createCertificate,
	deleteParticipants,
	deleteCertificates,
	searchCertificateByNumber,
	editParticipant,
	editCertificate,
};
