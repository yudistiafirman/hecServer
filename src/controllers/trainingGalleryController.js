const query = require("../config/connection");

const postTrainingGallery = async (req, res) => {
  try {
    const { name, status } = req.body;
    if (!name) {
      res.status(400).send({
        success: false,
        message: "Nama Galeri tidak boleh kosong",
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
        "INSERT INTO training_gallery (name, files_id , status_id) VALUES (?, ?, ?)",
        [name, insertFile.insertId, statusId[0].id]
      );
      res.status(201).send({
        success: true,
        message: "Galeri Pelatihan baru berhasil dibuat",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat Pembuatan Galeri Pelatihan ",
    });
  }
};

const getAllTrainingGallery = async (req, res) => {
  try {
    const search = req.query.search || "";
    const filterBy = req.query.filterBy || "";
    const page = parseInt(req.query.page) || 1; // Get the requested page from query parameters
    const limit = parseInt(req.query.limit) || 10; // Set the number of items to display per page
    const offset = (page - 1) * limit;

    let baseQuery = `SELECT training_gallery.id, training_gallery.name , training_gallery.created_at, files.file_url, status.status_name from training_gallery 
    join files on training_gallery.files_id = files.id
    join status on training_gallery.status_id = status.id  
    where status.status_name != 'DELETED' and training_gallery.name like '%${search}%' `;
    const values = [];

    baseQuery += `LIMIT ${limit} OFFSET ${offset}`;
    const partnerShipGalleryData = await query(baseQuery, values);
    const totalData = await query(
      `SELECT COUNT(*) AS total FROM training_gallery where status_id != (select id from status where status_name = 'DELETED')`
    );
    const total = totalData[0].total;
    const totalPages = Math.ceil(total / limit);
    res.status(200).send({
      page,
      limit,
      totalPages,
      totalItems: total,
      data: partnerShipGalleryData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat Pengambilan data Training Gallery  ",
    });
  }
};

const getOneTrainingGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const partnershipGalleryDetail = await query(
      `SELECT training_gallery.id, training_gallery.name , training_gallery.created_at, files.file_url, status.status_name from training_gallery 
    join files on training_gallery.files_id = files.id
    join status on training_gallery.status_id = status.id  where training_gallery.id = ?`,
      id
    );

    res.status(200).send({
      success: true,
      data: partnershipGalleryDetail[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat pengambilan data detail Gallery",
    });
  }
};

const deleteTrainingGallery = async (req, res) => {
  try {
    const { idToDelete } = req.body;

    if (!idToDelete || idToDelete.length === 0) {
      res.status(400).send({
        success: false,
        message: "id yang akan dihapus tidak boleh kosong",
      });
    } else {
      const updateValues = idToDelete
        .map(
          (v) =>
            `WHEN ${v} THEN (select id from status where status_name = 'DELETED')`
        )
        .join(" ");
      const updateIds = idToDelete.join(",");
      await query(`
      UPDATE training_gallery
      SET status_id =
        (CASE id ${updateValues} END)
      WHERE id IN (${updateIds});
    `);
    }
    res.status(200).send({
      success: true,
      message: "Berhasil menghapus Training Gallery",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat menghapus Training Gallery",
    });
  }
};

const updateTrainingGalleryStatus = async (req, res) => {
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
      await query("update training_gallery SET status_id = ? where id = ?", [
        statusId[0].id,
        id,
      ]);

      res.status(200).send({
        success: true,
        message: "Berhasil update status Training Gallery",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat update status Training Galleri ",
    });
  }
};

module.exports = {
  postTrainingGallery,
  getAllTrainingGallery,
  getOneTrainingGallery,
  deleteTrainingGallery,
  updateTrainingGalleryStatus,
};
