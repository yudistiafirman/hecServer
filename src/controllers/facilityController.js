const query = require("../config/connection");

const postFacility = async (req, res) => {
  try {
    const { facilityName, descriptions, status } = req.body;
    if (!facilityName) {
      res.status(400).send({
        success: false,
        message: "Nama Fasilitas tidak boleh kosong",
      });
    } else if (!descriptions) {
      res.status(400).send({
        success: false,
        message: "Deskripsi Fasiitas tidak boleh kosong",
      });
    } else {
      const statusId = await query(
        "select id from status where status_name = ?",
        status
      );

      const insertFile = await query(
        "INSERT into files (file_url) VALUES (?)",
        [req.imagePath[0].path]
      );

      await query(
        "INSERT INTO facility (facility_name, descriptions, files_id , status_id) VALUES (?, ?, ?, ?)",
        [facilityName, descriptions, insertFile.insertId, statusId[0].id]
      );
      res.status(201).send({
        success: true,
        message: "Fasilitas Pelatihan baru berhasil dibuat",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat Pembuatan Fasilitas Pelatihan ",
    });
  }
};

const getAllFacility = async (req, res) => {
  try {
    const search = req.query.search || "";
    const filterBy = req.query.filterBy || "";
    const page = parseInt(req.query.page) || 1; // Get the requested page from query parameters
    const limit = parseInt(req.query.limit) || 10; // Set the number of items to display per page
    const offset = (page - 1) * limit;

    let baseQuery = `SELECT facility.id, facility.facility_name , facility.created_at, facility.descriptions, files.file_url, status.status_name from facility 
    join files on facility.files_id = files.id
    join status on facility.status_id = status.id  
    where status.status_name != 'DELETED' and facility.facility_name like '%${search}%' `;
    const values = [];

    if (filterBy) {
      baseQuery += `and job_category_id = ?`;
      values.push(filterBy);
    }

    baseQuery += `LIMIT ${limit} OFFSET ${offset}`;
    const facilityData = await query(baseQuery, values);
    const totalData = await query(
      `SELECT COUNT(*) AS total FROM facility where status_id != (select id from status where status_name = 'DELETED')`
    );
    const total = totalData[0].total;
    const totalPages = Math.ceil(total / limit);
    res.status(200).send({
      page,
      limit,
      totalPages,
      totalItems: total,
      data: facilityData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat Pengambilan data Fasilitas  ",
    });
  }
};

const getOneFacility = async (req, res) => {
  try {
    const { id } = req.params;
    const facilityDetail = await query(
      `SELECT facility.id, facility.facility_name , facility.created_at, facility.descriptions, files.file_url, status.status_name from facility 
    join files on facility.files_id = files.id
    join status on facility.status_id = status.id  where facility.id = ?`,
      id
    );

    res.status(200).send({
      success: true,
      data: facilityDetail[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat pengambilan data detail Fasilitas",
    });
  }
};

updateFacilityStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    if (!status) {
      res.status(400).send({
        success: false,
        message: "Status tidak boleh kosong",
      });
    } else {
      const statusId = await query(
        "select id from status where status_name = ?",
        status
      );
      await query("update facility SET status_id = ? where id = ?", [
        statusId[0].id,
        id,
      ]);

      res.status(200).send({
        success: true,
        message: "Berhasil update status fasilitas",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat update status fasilitas ",
    });
  }
};

module.exports = {
  postFacility,
  getAllFacility,
  getOneFacility,
};
